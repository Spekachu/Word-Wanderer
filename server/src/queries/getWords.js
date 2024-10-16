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
            language_code: { in: [sourceLanguage, targetLanguage] },
            translation: { not: null }
          }
        }
      },
      include: {
        words_translations: {
          where: {
            language_code: { in: [sourceLanguage, targetLanguage] },
            translation: { not: null }
          }
        }
      }
    });

    // Step 1: Group words by target translation
    const groupedWords = words.reduce((acc, word) => {
      const targetTranslation = word.words_translations.find(t => t.language_code === targetLanguage);
      const sourceTranslation = word.words_translations.find(t => t.language_code === sourceLanguage);

      if (targetTranslation && sourceTranslation) {
        const key = targetTranslation.translation;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(word);
      }
      return acc;
    }, {});

    // Step 2 & 3: Process each group and format words
    const formattedWords = Object.values(groupedWords).map(group => {
      // Find the word with the highest translation rank (lowest rank number)
      const highestRankedWord = group.reduce((highest, current) => {
        const currentTargetTranslation = current.words_translations.find(t => t.language_code === targetLanguage);
        const highestTargetTranslation = highest.words_translations.find(t => t.language_code === targetLanguage);
        return (currentTargetTranslation.translation_rank || 0) < (highestTargetTranslation.translation_rank || 0) ? current : highest;
      });

      const sourceTranslation = highestRankedWord.words_translations.find(t => t.language_code === sourceLanguage);
      const targetTranslation = highestRankedWord.words_translations.find(t => t.language_code === targetLanguage);

      // Gather alternate source translations
      const alternateTranslations = group
        .filter(word => word !== highestRankedWord)
        .map(word => {
          const altSourceTranslation = word.words_translations.find(t => t.language_code === sourceLanguage);
          return {
            translation: altSourceTranslation.translation,
            literal_translation: altSourceTranslation.literal_translation,
            translation_rank: altSourceTranslation.translation_rank
          };
        });

      return {
        id: highestRankedWord.word_id,
        partOfSpeech: highestRankedWord.part_of_speech,
        level: highestRankedWord.level,
        frequencyScore: highestRankedWord.frequency_score,
        translations: {
          source: {
            languageCode: sourceLanguage,
            translation: sourceTranslation.translation,
            literal_translation: sourceTranslation.literal_translation,
            translationRank: sourceTranslation.translation_rank,
            alternateTranslations: alternateTranslations
          },
          target: {
            languageCode: targetLanguage,
            translation: targetTranslation.translation,
            literal_translation: targetTranslation.literal_translation,
            translationRank: targetTranslation.translation_rank
          }
        }
      };
    });

    return formattedWords;
  } catch (error) {
    console.error('Error fetching words with translations:', error);
    throw error;
  }
};

export { getWordsWithTranslations };