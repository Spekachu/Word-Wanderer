import initModels from '../models/init-models.js'; 
import sequelize from '../database/connection.js';
import { Op } from 'sequelize';

const { words, words_translations } = initModels(sequelize);

const getWordsWithTranslations = async (level = 'a1', partOfSpeech = 'verb', sourceLanguage = 'en', targetLanguage = 'de') => {
  try {
    const wordsWithTranslations = await words.findAll({
      where: {
        level: level,
        part_of_speech: partOfSpeech
      },
      include: [{
        model: words_translations,  // Join
        as: 'words_translations', 
        attributes: ['language_code', 'translation', 'literal_translation', 'translation_rank'],
        where: {
          language_code: [sourceLanguage, targetLanguage], 
					translation: { [Op.ne]: null }
        }
      }]
    });


		// Step 1: Group words by target translation
		const groupedWords = wordsWithTranslations.filter(word => {
			const sourceTranslation = word.words_translations.find(t => t.language_code === sourceLanguage);
			const targetTranslation = word.words_translations.find(t => t.language_code === targetLanguage);
			// Exclude the word if either the source or target translation is missing
			return sourceTranslation && targetTranslation;
		}).reduce((acc, word) => {
			const targetTranslation = word.words_translations.find(t => t.language_code === targetLanguage);

			if (targetTranslation) {
				const key = targetTranslation.translation; // Group by the target translation

				if (!acc[key]) {
					acc[key] = [];
				}

				acc[key].push(word); // Add the word to the group
			}

			return acc;
		}, {});

		// Step 2: Process each group
		const formattedWords = Object.values(groupedWords).map(group => {
			// Find the word with the highest translation rank
			const highestRankedWord = group.reduce((highest, current) => {
				const currentTargetTranslation = current.words_translations.find(t => t.language_code === targetLanguage);
				const highestTargetTranslation = highest.words_translations.find(t => t.language_code === targetLanguage);

				return currentTargetTranslation.translation_rank < highestTargetTranslation.translation_rank ? current : highest;
			});

			const highestTargetTranslation = highestRankedWord.words_translations.find(t => t.language_code === targetLanguage);

			// Step 3: Gather alternate source translations (lower ranked)
			const alternateTranslations = group
				.filter(word => word !== highestRankedWord) // Exclude the highest-ranked word
				.map(word => {
					const sourceTranslation = word.words_translations.find(t => t.language_code === sourceLanguage);
					return {
						translation: sourceTranslation.translation,
						literal_translation: sourceTranslation.literal_translation,
						translation_rank: sourceTranslation.translation_rank
					};
				});

			// Find the source and target translations for the highest-ranked word
			const sourceTranslation = highestRankedWord.words_translations.find(t => t.language_code === sourceLanguage);

			return {
				id: highestRankedWord.word_id,
				part_of_speech: highestRankedWord.part_of_speech,
				level: highestRankedWord.level,
				frequency_score: highestRankedWord.frequency_score,
				translations: {
					source: {
						language_code: sourceTranslation?.language_code,
						translation: sourceTranslation?.translation,
						literal_translation: sourceTranslation?.literal_translation,
						translation_rank: sourceTranslation?.translation_rank,
						alternate_translations: alternateTranslations // Attach alternate translations to the source
					},
					target: {
						language_code: highestTargetTranslation?.language_code,
						translation: highestTargetTranslation?.translation,
						literal_translation: highestTargetTranslation?.literal_translation,
						translation_rank: highestTargetTranslation?.translation_rank
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
