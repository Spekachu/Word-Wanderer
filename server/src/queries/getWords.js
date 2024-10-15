import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getWordsWithTranslations = async (level = 'a1', partOfSpeech = 'verb', sourceLanguage = 'en', targetLanguage = 'de') => {
  try {
    const wordsWithTranslations = await prisma.word.findMany({
      where: {
        level: level,
        partOfSpeech: partOfSpeech,
        translations: {
          some: {
            languageCode: {
              in: [sourceLanguage, targetLanguage]
            },
            translation: {
              not: null
            }
          }
        }
      },
      include: {
        translations: {
          where: {
            languageCode: {
              in: [sourceLanguage, targetLanguage]
            },
            translation: {
              not: null
            }
          }
        }
      }
    });

    // Step 1: Group words by target translation
    const groupedWords = wordsWithTranslations.filter(word => {
      const sourceTranslation = word.translations.find(t => t.languageCode === sourceLanguage);
      const targetTranslation = word.translations.find(t => t.languageCode === targetLanguage);
      return sourceTranslation && targetTranslation;
    }).reduce((acc, word) => {
      const targetTranslation = word.translations.find(t => t.languageCode === targetLanguage);

      if (targetTranslation) {
        const key = targetTranslation.translation;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(word);
      }

      return acc;
    }, {});

    // Step 2 and 3: Process each group and gather alternate translations
    const formattedWords = Object.values(groupedWords).map(group => {
      const highestRankedWord = group.reduce((highest, current) => {
        const currentTargetTranslation = current.translations.find(t => t.languageCode === targetLanguage);
        const highestTargetTranslation = highest.translations.find(t => t.languageCode === targetLanguage);

        return currentTargetTranslation.translationRank < highestTargetTranslation.translationRank ? current : highest;
      });

      const highestTargetTranslation = highestRankedWord.translations.find(t => t.languageCode === targetLanguage);
      const sourceTranslation = highestRankedWord.translations.find(t => t.languageCode === sourceLanguage);

      const alternateTranslations = group
        .filter(word => word !== highestRankedWord)
        .map(word => {
          const altSourceTranslation = word.translations.find(t => t.languageCode === sourceLanguage);
          return {
            translation: altSourceTranslation.translation,
            literalTranslation: altSourceTranslation.literalTranslation,
            translationRank: altSourceTranslation.translationRank
          };
        });

      return {
        id: highestRankedWord.id,
        partOfSpeech: highestRankedWord.partOfSpeech,
        level: highestRankedWord.level,
        frequencyScore: highestRankedWord.frequencyScore,
        translations: {
          source: {
            languageCode: sourceTranslation?.languageCode,
            translation: sourceTranslation?.translation,
            literalTranslation: sourceTranslation?.literalTranslation,
            translationRank: sourceTranslation?.translationRank,
            alternateTranslations: alternateTranslations
          },
          target: {
            languageCode: highestTargetTranslation?.languageCode,
            translation: highestTargetTranslation?.translation,
            literalTranslation: highestTargetTranslation?.literalTranslation,
            translationRank: highestTargetTranslation?.translationRank
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