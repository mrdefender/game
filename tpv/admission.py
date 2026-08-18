
def get_required_flip_questions(context=None):
    context = context or {}

    getter = context.get("tpv_editor_required_flip_questions")

    if callable(getter):
        try:
            return int(getter())
        except (TypeError, ValueError):
            pass

    return int(context.get("TPV_REQUIRED_FLIP_QUESTIONS", 5))


def check_player_admission(flip_col, context=None):
    required = get_required_flip_questions(context)
    flip_col = int(flip_col or 0)

    approved = flip_col >= required

    return {
        "approved": approved,
        "flip_col": flip_col,
        "required_questions": required,
        "message": (
            "Допущен"
            if approved
            else f"Недостаточно вопросов: {flip_col}/{required}"
        ),
    }
