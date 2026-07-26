from __future__ import annotations


HUNDREDS = {
    1: "num_100.ogg",
    2: "num_200.ogg",
    3: "num_300.ogg",
    4: "num_400.ogg",
    5: "num_500.ogg",
    6: "num_600.ogg",
    7: "num_700.ogg",
    8: "num_800.ogg",
    9: "num_900.ogg",
}

TENS = {
    2: "num_20.ogg",
    3: "num_30.ogg",
    4: "num_40.ogg",
    5: "num_50.ogg",
    6: "num_60.ogg",
    7: "num_70.ogg",
    8: "num_80.ogg",
    9: "num_90.ogg",
}

TEENS = {
    number: f"num_{number}.ogg"
    for number in range(10, 20)
}

ONES_MASCULINE = {
    1: "num_1n.ogg",
    2: "num_2a.ogg",
    3: "num_3.ogg",
    4: "num_4.ogg",
    5: "num_5.ogg",
    6: "num_6.ogg",
    7: "num_7.ogg",
    8: "num_8.ogg",
    9: "num_9.ogg",
}

ONES_FEMININE = {
    **ONES_MASCULINE,
    1: "num_1a.ogg",
    2: "num_2e.ogg",
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
                "num_million.ogg",
                "num_milliona.ogg",
                "num_millionov.ogg",
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
                "num_tisyacha.ogg",
                "num_tisyachi.ogg",
                "num_tisyach.ogg",
            )
        )

    if units:
        result.extend(triad_to_audio(units))

    if include_currency:
        result.append(
            plural_form(
                number,
                "num_foxcoin.ogg",
                "num_foxcoina.ogg",
                "num_foxcoinov.ogg",
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
    