from app.domain.models import GenerateAnimationCommand


def build_sprite_sheet_prompt(command: GenerateAnimationCommand) -> str:
    loop_rule = (
        "Pose 6 must transition naturally back to pose 1 for a loop."
        if command.loop
        else "Pose 6 must be a clear final state for the described action."
    )
    reference_rule = (
        "The reference is a turnaround sheet. Use all views only to preserve identity; "
        "do not copy the reference views into output cells."
        if command.reference.reference_type.value == "turnaround"
        else "Use the supplied image only as the subject identity and visual-design reference."
    )
    return f"""Create exactly one animation sprite sheet from the supplied reference image.

USER ACTION DESCRIPTION (the only source of action semantics):
<action>
{command.action_prompt.strip()}
</action>

Decompose that action into exactly six chronological key poses. The poses must show a basic,
visually continuous progression of the supplied action. Do not replace the action with a stock
or preset motion. {loop_rule}

OUTPUT CONTRACT:
- Exactly one 1536x1024 PNG sprite sheet.
- Exactly 3 columns and 2 rows; each logical cell is exactly 512x512.
- Row-major time order: 1,2,3 on the top row; 4,5,6 on the bottom row.
- Exactly one complete subject in each cell; no missing, duplicate, or extra poses.
- Keep identity, proportions, outfit/object design, colors, rendering style, scale, camera,
  perspective, and facing direction consistent in all cells.
- Keep every subject inside its own cell with safe space around the edges.
- Use the same clean, plain, solid-color background in every cell, without scenery or shadows.
- Do not draw text, numbers, labels, borders, grid lines, captions, reference views, contact
  sheets, backgrounds, or content spanning cells.

REFERENCE RULE:
{reference_rule}
"""
