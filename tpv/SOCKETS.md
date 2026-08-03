# TPV Socket.IO — этап 11.4

Перенесено событий: **33**

```text
room:join_tpv
count_answer_interactive
clean_db_tpv
tpv_spectator_ready
tpv_selection_start
tpv_versus
choose_player_random
choose_player_id
reset_to_wait_tpv
tpv_bong_prepare
tpv_bong_selected
tpv_bong_value
tpv_bong_stop_ack
tpv_bong_result
tpv_bong_hide
tpv_bong_stop_request
generate_safe_bong_game
generate_sum_for_bong_game
take_question
add_result_author
add_result_player
tpv_update_data_user_spec
show_tree
hide_tree
show_stats
hide_stats
tpv_correct
tpv_pass
tpv_flip
tpv_wrong
start_intro
host_show_credits_tpv
show_results_tpv
```

## Совместимость

- имена событий не менялись;
- комнаты Socket.IO не менялись;
- payload не менялись;
- JS ведущего, игрока и зрителя не менялся;
- `update_users_tpv` возвращается в `game.py` как совместимый экспорт.

## Что остаётся в game.py

Общие события подключения и все Socket.IO-обработчики игры
«Свободный слот».
