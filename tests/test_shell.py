import aiida
from aiida_worktree import WorkTree
from aiida_shell.launch import prepare_code
from aiida.orm import SinglefileData

aiida.load_profile()


def test_shell_date():
    # Create a code on the local computer
    cat_code = prepare_code("cat")
    # Create a worktree
    wt = WorkTree(name="test_shell_cat_with_file_arguments")
    job1 = wt.nodes.new(
        "AiiDAShell",
        code=cat_code,
        arguments=["{file_a}", "{file_b}"],
        nodes={
            "file_a": SinglefileData.from_string("string a"),
            "file_b": SinglefileData.from_string("string b"),
        },
    )
    wt.submit(wait=True)
    assert job1.node.outputs.stdout.get_content() == "string astring b"
