import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getUserWordAssociations = async (userId) => {
  try {
    const userAssociations = await prisma.user_word_associations.findMany({
      where: { user_id: userId },
      select: { word_id: true, emoji: true, highlight_color: true, language_codes: true }
    });

    // This code transforms the array of user associations into an object
    // where each word_id is a key, and the value is an object containing
    // the associated emoji, highlight color, and language codes.
    // This transformation is necessary for easier and more efficient
    // access to word associations on the client-side.
    return userAssociations.reduce((acc, assoc) => {
      acc[assoc.word_id] = { 
        emoji: assoc.emoji, 
        highlightColor: assoc.highlight_color, 
        languageCodes: assoc.language_codes 
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user word associations:', error);
    throw error;
  }
};

export { getUserWordAssociations };