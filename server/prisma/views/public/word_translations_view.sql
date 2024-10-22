WITH primary_translations AS (
  SELECT
    words_translations.word_id,
    words_translations.language_code,
    words_translations.translation,
    words_translations.literal_translation,
    words_translations.translation_rank,
    row_number() OVER (
      PARTITION BY words_translations.word_id,
      words_translations.language_code
      ORDER BY
        words_translations.translation_rank
    ) AS rn
  FROM
    words_translations
)
SELECT
  DISTINCT ON (w.word_id) w.word_id,
  w.part_of_speech,
  w.level,
  w.frequency_score,
  en.translation AS en_translation,
  en.literal_translation AS en_literal_translation,
  de.translation AS de_translation,
  de.literal_translation AS de_literal_translation,
  es.translation AS es_translation,
  es.literal_translation AS es_literal_translation,
  fr.translation AS fr_translation,
  fr.literal_translation AS fr_literal_translation
FROM
  (
    (
      (
        (
          words w
          LEFT JOIN primary_translations en ON (
            (
              (w.word_id = en.word_id)
              AND (en.language_code = 'en' :: bpchar)
              AND (en.rn = 1)
            )
          )
        )
        LEFT JOIN primary_translations de ON (
          (
            (w.word_id = de.word_id)
            AND (de.language_code = 'de' :: bpchar)
            AND (de.rn = 1)
          )
        )
      )
      LEFT JOIN primary_translations es ON (
        (
          (w.word_id = es.word_id)
          AND (es.language_code = 'es' :: bpchar)
          AND (es.rn = 1)
        )
      )
    )
    LEFT JOIN primary_translations fr ON (
      (
        (w.word_id = fr.word_id)
        AND (fr.language_code = 'fr' :: bpchar)
        AND (fr.rn = 1)
      )
    )
  );