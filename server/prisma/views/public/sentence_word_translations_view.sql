WITH sentence_translations AS (
  SELECT
    sentences_translations.sentence_id,
    sentences_translations.language_code,
    sentences_translations.translation,
    sentences_translations.literal_translation,
    row_number() OVER (
      PARTITION BY sentences_translations.sentence_id,
      sentences_translations.language_code
      ORDER BY
        sentences_translations.translation_rank
    ) AS rn
  FROM
    sentences_translations
)
SELECT
  DISTINCT ON (s.sentence_id) s.sentence_id,
  s.level AS sentence_level,
  s.frequency_score AS sentence_frequency,
  en_s.translation AS en_sentence,
  en_s.literal_translation AS en_sentence_literal,
  de_s.translation AS de_sentence,
  de_s.literal_translation AS de_sentence_literal,
  es_s.translation AS es_sentence,
  es_s.literal_translation AS es_sentence_literal,
  fr_s.translation AS fr_sentence,
  fr_s.literal_translation AS fr_sentence_literal,
  jsonb_agg(
    jsonb_build_object(
      'word_id',
      w.word_id,
      'part_of_speech',
      w.part_of_speech,
      'level',
      w.level,
      'en_translation',
      wt.en_translation,
      'de_translation',
      wt.de_translation,
      'es_translation',
      wt.es_translation,
      'fr_translation',
      wt.fr_translation
    )
  ) AS words
FROM
  (
    (
      (
        (
          (
            (
              (
                sentences s
                LEFT JOIN sentence_translations en_s ON (
                  (
                    (s.sentence_id = en_s.sentence_id)
                    AND (en_s.language_code = 'en' :: bpchar)
                    AND (en_s.rn = 1)
                  )
                )
              )
              LEFT JOIN sentence_translations de_s ON (
                (
                  (s.sentence_id = de_s.sentence_id)
                  AND (de_s.language_code = 'de' :: bpchar)
                  AND (de_s.rn = 1)
                )
              )
            )
            LEFT JOIN sentence_translations es_s ON (
              (
                (s.sentence_id = es_s.sentence_id)
                AND (es_s.language_code = 'es' :: bpchar)
                AND (es_s.rn = 1)
              )
            )
          )
          LEFT JOIN sentence_translations fr_s ON (
            (
              (s.sentence_id = fr_s.sentence_id)
              AND (fr_s.language_code = 'fr' :: bpchar)
              AND (fr_s.rn = 1)
            )
          )
        )
        LEFT JOIN sentence_words sw ON ((s.sentence_id = sw.sentence_id))
      )
      LEFT JOIN words w ON ((sw.word_id = w.word_id))
    )
    LEFT JOIN word_translations_view wt ON ((w.word_id = wt.word_id))
  )
GROUP BY
  s.sentence_id,
  s.level,
  s.frequency_score,
  en_s.translation,
  en_s.literal_translation,
  de_s.translation,
  de_s.literal_translation,
  es_s.translation,
  es_s.literal_translation,
  fr_s.translation,
  fr_s.literal_translation;