def worktree_to_short_json(wtdata):
    """Export a worktree to a rete js editor data."""
    wtdata_short = {
        "name": wtdata["name"],
        "uuid": wtdata["uuid"],
        "state": wtdata["state"],
        "nodes": {},
        "links": wtdata["links"],
    }
    #
    for name, node in wtdata["nodes"].items():
        wtdata_short["nodes"][name] = {
            "label": node["name"],
            "inputs": [],
            "outputs": [],
        }
    for link in wtdata["links"]:
        wtdata_short["nodes"][link["to_node"]]["inputs"].append(
            {
                "name": link["to_socket"],
            }
        )
        wtdata_short["nodes"][link["from_node"]]["outputs"].append(
            {
                "name": link["from_socket"],
            }
        )
    return wtdata_short


def get_node_summary(node):
    """ """
    from plumpy import ProcessState
    from aiida.orm import ProcessNode

    table = []

    if isinstance(node, ProcessNode):
        table.append(["type", node.process_label])

        try:
            process_state = ProcessState(node.process_state)
        except (AttributeError, ValueError):
            pass
        else:
            process_state_string = process_state.value.capitalize()

            if process_state == ProcessState.FINISHED and node.exit_message:
                table.append(
                    [
                        "state",
                        f"{process_state_string} [{node.exit_status}] {node.exit_message}",
                    ]
                )
            elif process_state == ProcessState.FINISHED:
                table.append(["state", f"{process_state_string} [{node.exit_status}]"])
            elif process_state == ProcessState.EXCEPTED:
                table.append(["state", f"{process_state_string} <{node.exception}>"])
            else:
                table.append(["state", process_state_string])

    else:
        table.append(["type", node.__class__.__name__])
    table.append(["pk", str(node.pk)])
    table.append(["uuid", str(node.uuid)])
    table.append(["label", node.label])
    table.append(["description", node.description])
    table.append(["ctime", node.ctime])
    table.append(["mtime", node.mtime])

    try:
        computer = node.computer
    except AttributeError:
        pass
    else:
        if computer is not None:
            table.append(["computer", f"[{node.computer.pk}] {node.computer.label}"])

    return table
