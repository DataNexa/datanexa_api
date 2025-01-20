CREATE TEMPORARY TABLE ConsecutiveErrors AS
SELECT
    t.token_push_notifications_device_id
FROM
    notification_messages t
LEFT JOIN (
    SELECT
        token_push_notifications_device_id,
        enviado_em
    FROM
        notification_messages
    WHERE
        enviado = 1
    AND enviado_em >= DATE_SUB(NOW(), INTERVAL 7 DAY)
) s ON t.token_push_notifications_device_id = s.token_push_notifications_device_id
    AND s.enviado_em BETWEEN t.enviado_em - INTERVAL 1 DAY AND t.enviado_em
WHERE
    t.enviado = 0
    AND s.token_push_notifications_device_id IS NULL
GROUP BY
    t.token_push_notifications_device_id
HAVING
    COUNT(*) >= 3;

UPDATE token_push_notifications_device
SET ativo = '0'
WHERE id IN (
    SELECT token_push_notifications_device_id
    FROM ConsecutiveErrors
);

DROP TEMPORARY TABLE ConsecutiveErrors;