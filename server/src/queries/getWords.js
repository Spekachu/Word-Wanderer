import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getWordsWithTranslations = async (level = 'a1', partOfSpeech = 'verb', sourceLanguage = 'en', targetLanguage = 'de') => {
  try {
    let words = await prisma.words.findMany({
      where: {
        level,
        part_of_speech: partOfSpeech,
        words_translations: {
          some: {
            language_code: { in: [sourceLanguage, targetLanguage] }
          }
        }
      },
      include: {
        words_translations: {
          where: {
            language_code: { in: [sourceLanguage, targetLanguage] }
          }
        }
      }
    });

    // Format words
    words = words.map(word => {
      const sourceTranslations = word.words_translations.filter(t => t.language_code === sourceLanguage);
      const targetTranslations = word.words_translations.filter(t => t.language_code === targetLanguage);

      return {
        id: word.word_id,
        partOfSpeech: word.part_of_speech,
        level: word.level,
        frequencyScore: word.frequency_score,
        translations: {
          source: {
            languageCode: sourceLanguage,
            translation: sourceTranslations[0]?.translation,
            literalTranslation: sourceTranslations[0]?.literal_translation,
            translationRank: sourceTranslations[0]?.translation_rank,
            alternateTranslations: sourceTranslations.slice(1).map(t => ({
              translation: t.translation,
              literalTranslation: t.literal_translation,
              translationRank: t.translation_rank
            }))
          },
          target: {
            languageCode: targetLanguage,
            translation: targetTranslations[0]?.translation,
            literalTranslation: targetTranslations[0]?.literal_translation,
            translationRank: targetTranslations[0]?.translation_rank
          }
        }
      };
    });

    // Group words by target translation
    const groupedWords = words.reduce((acc, word) => {
      const key = word.translations.target.translation;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(word);
      return acc;
    }, {});

    // Process each group and gather alternate translations
    const formattedWords = Object.values(groupedWords).map(group => {
      const highestRankedWord = group.reduce((highest, current) => 
        current.translations.target.translationRank < highest.translations.target.translationRank ? current : highest
      );

      highestRankedWord.translations.source.alternateTranslations = group
        .filter(word => word !== highestRankedWord)
        .map(word => ({
          translation: word.translations.source.translation,
          literalTranslation: word.translations.source.literalTranslation,
          translationRank: word.translations.source.translationRank
        }));

      return highestRankedWord;
    });

    return formattedWords;
  } catch (error) {
    console.error('Error fetching words with translations:', error);
    throw error;
  }
};

export { getWordsWithTranslations };