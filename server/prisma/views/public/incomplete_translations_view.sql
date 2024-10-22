SELECT
  DISTINCT ON (word_id) word_id,
  part_of_speech,
  LEVEL,
  frequency_score,
  array_remove(
    ARRAY [
        CASE
            WHEN (en_translation IS NULL) THEN 'en'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (de_translation IS NULL) THEN 'de'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (es_translation IS NULL) THEN 'es'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (fr_translation IS NULL) THEN 'fr'::text
            ELSE NULL::text
        END],
    NULL :: text
  ) AS missing_languages,
  array_remove(
    ARRAY [
        CASE
            WHEN (en_translation IS NOT NULL) THEN 'en'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (de_translation IS NOT NULL) THEN 'de'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (es_translation IS NOT NULL) THEN 'es'::text
            ELSE NULL::text
        END,
        CASE
            WHEN (fr_translation IS NOT NULL) THEN 'fr'::text
            ELSE NULL::text
        END],
    NULL :: text
  ) AS available_languages,
  en_translation,
  de_translation,
  es_translation,
  fr_translation
FROM
  word_translations_view
WHERE
  (
    (en_translation IS NULL)
    OR (de_translation IS NULL)
    OR (es_translation IS NULL)
    OR (fr_translation IS NULL)
  );