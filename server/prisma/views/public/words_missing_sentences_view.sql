WITH word_sentence_counts AS (
  SELECT
    DISTINCT ON (w.word_id) w.word_id,
    w.part_of_speech,
    w.level,
    w.frequency_score,
    wt.en_translation,
    wt.de_translation,
    wt.es_translation,
    wt.fr_translation,
    count(DISTINCT sw.sentence_id) AS total_sentences,
    count(
      DISTINCT CASE
        WHEN (st.language_code = 'en' :: bpchar) THEN sw.sentence_id
        ELSE NULL :: integer
      END
    ) AS en_sentences,
    count(
      DISTINCT CASE
        WHEN (st.language_code = 'de' :: bpchar) THEN sw.sentence_id
        ELSE NULL :: integer
      END
    ) AS de_sentences,
    count(
      DISTINCT CASE
        WHEN (st.language_code = 'es' :: bpchar) THEN sw.sentence_id
        ELSE NULL :: integer
      END
    ) AS es_sentences,
    count(
      DISTINCT CASE
        WHEN (st.language_code = 'fr' :: bpchar) THEN sw.sentence_id
        ELSE NULL :: integer
      END
    ) AS fr_sentences
  FROM
    (
      (
        (
          (
            words w
            LEFT JOIN word_translations_view wt ON ((w.word_id = wt.word_id))
          )
          LEFT JOIN sentence_words sw ON ((w.word_id = sw.word_id))
        )
        LEFT JOIN sentences s ON ((sw.sentence_id = s.sentence_id))
      )
      LEFT JOIN sentences_translations st ON ((s.sentence_id = st.sentence_id))
    )
  GROUP BY
    w.word_id,
    w.part_of_speech,
    w.level,
    w.frequency_score,
    wt.en_translation,
    wt.de_translation,
    wt.es_translation,
    wt.fr_translation
)
SELECT
  word_id,
  part_of_speech,
  LEVEL,
  frequency_score,
  en_translation,
  de_translation,
  es_translation,
  fr_translation,
  total_sentences,
  array_remove(
    ARRAY [
        CASE
            WHEN ((en_sentences = 0) AND (en_translation IS NOT NULL)) THEN 'en'::text
            ELSE NULL::text
        END,
        CASE
            WHEN ((de_sentences = 0) AND (de_translation IS NOT NULL)) THEN 'de'::text
            ELSE NULL::text
        END,
        CASE
            WHEN ((es_sentences = 0) AND (es_translation IS NOT NULL)) THEN 'es'::text
            ELSE NULL::text
        END,
        CASE
            WHEN ((fr_sentences = 0) AND (fr_translation IS NOT NULL)) THEN 'fr'::text
            ELSE NULL::text
        END],
    NULL :: text
  ) AS languages_missing_sentences,
  en_sentences,
  de_sentences,
  es_sentences,
  fr_sentences
FROM
  word_sentence_counts
WHERE
  (
    (
      (en_translation IS NOT NULL)
      AND (en_sentences = 0)
    )
    OR (
      (de_translation IS NOT NULL)
      AND (de_sentences = 0)
    )
    OR (
      (es_translation IS NOT NULL)
      AND (es_sentences = 0)
    )
    OR (
      (fr_translation IS NOT NULL)
      AND (fr_sentences = 0)
    )
  );