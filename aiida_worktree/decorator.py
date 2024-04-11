from typing import Callable
from aiida_worktree.utils import get_executor
from aiida.engine.processes.functions import calcfunction, workfunction
from aiida.engine.processes.calcjobs import CalcJob
from aiida.engine.processes.workchains import WorkChain
from aiida.orm.nodes.process.calculation.calcfunction import CalcFunctionNode
from aiida.orm.nodes.process.workflow.workfunction import WorkFunctionNode
from aiida.engine.processes.ports import PortNamespace
from node_graph.decorator import create_node
import cloudpickle as pickle


def add_input_recursive(inputs, port, prefix=None):
    """Add input recursively."""
    if prefix is None:
        port_name = port.name
    else:
        port_name = f"{prefix}.{port.name}"
    if isinstance(port, PortNamespace):
        # TODO the default value is {} could cause problem, because the address of the dict is the same,
        # so if you change the value of one port, the value of all the ports of other nodes will be changed
        # consider to use None as default value
        inputs.append(
            ["General", port_name, {"property": ["General", {"default": {}}]}]
        )
        for value in port.values():
            add_input_recursive(inputs, value, prefix=port_name)
    else:
        inputs.append(["General", port_name])
    return inputs


def build_node(ndata):
    """Register a node from a AiiDA component."""
    from aiida_worktree.node import Node
    import inspect

    path, executor_name, = ndata.pop(
        "path"
    ).rsplit(".", 1)
    ndata["executor"] = {"path": path, "name": executor_name}
    executor, type = get_executor(ndata["executor"])
    # print(executor)
    if inspect.isfunction(executor):
        # calcfunction and workfunction
        if getattr(executor, "node_class", False):
            if executor.node_class is CalcFunctionNode:
                ndata["node_type"] = "calcfunction"
            elif executor.node_class is WorkFunctionNode:
                ndata["node_type"] = "workfunction"
        else:
            ndata["node_type"] = "normal"
    else:
        if issubclass(executor, CalcJob):
            ndata["node_type"] = "calcjob"
        elif issubclass(executor, WorkChain):
            ndata["node_type"] = "workchain"
        else:
            ndata["node_type"] = "normal"
    inputs = []
    outputs = []
    spec = executor.spec()
    for _key, port in spec.inputs.ports.items():
        add_input_recursive(inputs, port)
    kwargs = [input[1] for input in inputs]
    for _key, port in spec.outputs.ports.items():
        outputs.append(["General", port.name])
    if spec.inputs.dynamic:
        ndata["var_kwargs"] = spec.inputs.dynamic
        inputs.append(
            ["General", spec.inputs.dynamic, {"property": ["General", {"default": {}}]}]
        )
    # print("kwargs: ", kwargs)
    # add built-in sockets
    outputs.append(["General", "_outputs"])
    outputs.append(["General", "_wait"])
    inputs.append(["General", "_wait", {"link_limit": 1e6}])
    ndata["node_class"] = Node
    ndata["kwargs"] = kwargs
    ndata["inputs"] = inputs
    ndata["outputs"] = outputs
    ndata["identifier"] = ndata.pop("identifier", ndata["executor"]["name"])
    # TODO In order to reload the WorkTree from process, "is_pickle" should be True
    # so I pickled the function here, but this is not necessary
    # we need to update the node_graph to support the path and name of the function
    executor = {
        "executor": pickle.dumps(executor),
        "type": ndata["node_type"],
        "is_pickle": True,
    }
    ndata["executor"] = executor
    node = create_node(ndata)
    return node


def serialize_function(func):
    """Serialize a function for storage or transmission."""
    import cloudpickle as pickle

    return {
        "executor": pickle.dumps(func),
        "type": "function",
        "is_pickle": True,
    }


def generate_ndata(
    func: Callable,
    identifier: str,
    inputs: list,
    outputs: list,
    properties: list,
    catalog: str,
    node_type: str,
    additional_data: dict = None,
):
    """Generate node data for creating a node."""
    from node_graph.decorator import generate_input_sockets
    from aiida_worktree.node import Node

    args, kwargs, var_args, var_kwargs, _inputs = generate_input_sockets(
        func, inputs, properties
    )
    node_outputs = [["General", output[1]] for output in outputs]
    # add built-in sockets
    _inputs.append(["General", "_wait", {"link_limit": 1e6}])
    node_outputs.append(["General", "_wait"])
    node_outputs.append(["General", "_outputs"])
    ndata = {
        "node_class": Node,
        "identifier": identifier,
        "args": args,
        "kwargs": kwargs,
        "var_args": var_args,
        "var_kwargs": var_kwargs,
        "node_type": node_type,
        "properties": properties,
        "inputs": _inputs,
        "outputs": node_outputs,
        "executor": serialize_function(func),
        "catalog": catalog,
    }
    if additional_data:
        ndata.update(additional_data)
    return ndata


class NodeDecoratorCollection:
    """Collection of node decorators."""

    # decorator with arguments indentifier, args, kwargs, properties, inputs, outputs, executor
    @staticmethod
    def decorator_node(
        identifier=None,
        node_type="Normal",
        properties=None,
        inputs=None,
        outputs=None,
        catalog="Others",
        executor_type="function",
    ):
        """Generate a decorator that register a function as a node.

        Attributes:
            indentifier (str): node identifier
            catalog (str): node catalog
            args (list): node args
            kwargs (dict): node kwargs
            properties (list): node properties
            inputs (list): node inputs
            outputs (list): node outputs
        """

        def decorator(func):
            nonlocal identifier

            if identifier is None:
                identifier = func.__name__

            # Determine node_type based on AiiDA's node classes
            node_type = "Normal"
            if hasattr(func, "node_class"):
                if func.node_class is CalcFunctionNode:
                    node_type = "calcfunction"
                elif func.node_class is WorkFunctionNode:
                    node_type = "workfunction"
            ndata = generate_ndata(
                func,
                identifier,
                inputs or [],
                outputs or [["General", "result"]],
                properties or [],
                catalog,
                node_type,
            )
            node = create_node(ndata)
            func.identifier = identifier
            func.node = node
            return func

        return decorator

    # decorator with arguments indentifier, args, kwargs, properties, inputs, outputs, executor
    @staticmethod
    def decorator_node_group(
        identifier=None,
        properties=None,
        inputs=None,
        outputs=None,
        catalog="Others",
        executor_type="function",
    ):
        """Generate a decorator that register a node group as a node.

        Attributes:
            indentifier (str): node identifier
            catalog (str): node catalog
            properties (list): node properties
            inputs (list): node inputs
            outputs (list): node outputs
        """

        outputs = outputs or []

        def decorator(func):
            nonlocal identifier, inputs, outputs

            if identifier is None:
                identifier = func.__name__
            # use cloudpickle to serialize function
            func.identifier = identifier
            func.group_outputs = outputs

            node_outputs = [["General", output[1]] for output in outputs]
            # print(node_inputs, node_outputs)
            #
            node_type = "worktree"
            ndata = generate_ndata(
                func,
                identifier,
                inputs or [],
                node_outputs,
                properties or [],
                catalog,
                node_type,
            )
            node = create_node(ndata)
            node.group_inputs = inputs
            node.group_outputs = outputs
            func.node = node
            return func

        return decorator

    @staticmethod
    def calcfunction(**kwargs):
        def decorator(func):
            # First, apply the calcfunction decorator
            calcfunc_decorated = calcfunction(func)
            # Then, apply node decorator
            node_decorated = node(**kwargs)(calcfunc_decorated)

            return node_decorated

        return decorator

    @staticmethod
    def workfunction(**kwargs):
        def decorator(func):
            # First, apply the workfunction decorator
            calcfunc_decorated = workfunction(func)
            node_decorated = node(**kwargs)(calcfunc_decorated)

            return node_decorated

        return decorator

    # Making decorator_node accessible as 'node'
    node = decorator_node

    # Making decorator_node_group accessible as 'group'
    group = decorator_node_group

    def __call__(self, *args, **kwargs):
        # This allows using '@node' to directly apply the decorator_node functionality
        return self.decorator_node(*args, **kwargs)


node = NodeDecoratorCollection()
