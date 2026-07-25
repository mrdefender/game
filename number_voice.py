from __future__ import annotations


HUNDREDS = {
    1: "num_100.mp3",
    2: "num_200.mp3",
    3: "num_300.mp3",
    4: "num_400.mp3",
    5: "num_500.mp3",
    6: "num_600.mp3",
    7: "num_700.mp3",
    8: "num_800.mp3",
    9: "num_900.mp3",
}

TENS = {
    2: "num_20.mp3",
    3: "num_30.mp3",
    4: "num_40.mp3",
    5: "num_50.mp3",
    6: "num_60.mp3",
    7: "num_70.mp3",
    8: "num_80.mp3",
    9: "num_90.mp3",
}

TEENS = {
    number: f"num_{number}.mp3"
    for number in range(10, 20)
}

ONES_MASCULINE = {
    1: "num_1n.mp3",
    2: "num_2a.mp3",
    3: "num_3.mp3",
    4: "num_4.mp3",
    5: "num_5.mp3",
    6: "num_6.mp3",
    7: "num_7.mp3",
    8: "num_8.mp3",
    9: "num_9.mp3",
}

ONES_FEMININE = {
    **ONES_MASCULINE,
    1: "num_1a.mp3",
    2: "num_2e.mp3",
}


def plural_form(
    value: int,
    one: str,
    few: str,
    many: str,
) -> str:
    last_two = value % 100

    if 11 <= last_two <= 14:
        return many

    last = value % 10

    if last == 1:
        return one

    if 2 <= last <= 4:
        return few

    return many


def triad_to_audio(
    value: int,
    feminine: bool = False,
) -> list[str]:
    if not 0 <= value <= 999:
        raise ValueError("Часть числа должна быть от 0 до 999")

    result = []

    hundreds = value // 100
    remainder = value % 100

    if hundreds:
        result.append(HUNDREDS[hundreds])

    if 10 <= remainder <= 19:
        result.append(TEENS[remainder])
        return result

    tens = remainder // 10
    ones = remainder % 10

    if tens:
        result.append(TENS[tens])

    if ones:
        forms = ONES_FEMININE if feminine else ONES_MASCULINE
        result.append(forms[ones])

    return result


def number_to_audio(
    number: int,
    include_currency: bool = True,
) -> list[str]:
    if not 1 <= number <= 999_999_999:
        raise ValueError(
            "Поддерживаются числа от 1 до 999 999 999"
        )

    result = []

    millions = number // 1_000_000
    thousands = (number // 1_000) % 1_000
    units = number % 1_000

    if millions:
        result.extend(triad_to_audio(millions))

        result.append(
            plural_form(
                millions,
                "num_million.mp3",
                "num_milliona.mp3",
                "num_millionov.mp3",
            )
        )

    if thousands:
        result.extend(
            triad_to_audio(
                thousands,
                feminine=True,
            )
        )

        result.append(
            plural_form(
                thousands,
                "num_tisyacha.mp3",
                "num_tisyachi.mp3",
                "num_tisyach.mp3",
            )
        )

    if units:
        result.extend(triad_to_audio(units))

    if include_currency:
        result.append(
            plural_form(
                number,
                "num_foxcoin.mp3",
                "num_foxcoina.mp3",
                "num_foxcoinov.mp3",
            )
        )

    return result
    
'''    
  # Добавить в основной файл  
 # from flask import jsonify, request, url_for

# from voice.number_voice import number_to_audio
@app.post("/api/voice-number")
def api_voice_number():
    data = request.get_json(silent=True) or {}

    try:
        number = int(data.get("number"))
    except (TypeError, ValueError):
        return jsonify({
            "ok": False,
            "error": "Необходимо передать целое число",
        }), 400

    include_currency = bool(
        data.get("include_currency", False)
    )

    try:
        filenames = number_to_audio(
            number,
            include_currency=include_currency,
        )
    except ValueError as error:
        return jsonify({
            "ok": False,
            "error": str(error),
        }), 400

    urls = [
        url_for(
            "static",
            filename=f"sounds/tpv/bong-game/{filename}",
        )
        for filename in filenames
    ]

    return jsonify({
        "ok": True,
        "number": number,
        "files": filenames,
        "urls": urls,
    })
    <script src="{{ url_for('static', filename='js/number_voice.js') }}"></script>
    await NumberVoice.speak(15000{includeCurrency: false});
    
    '''
    