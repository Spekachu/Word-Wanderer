import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getUserWordAssociations = async (userId) => {
  try {
    const userAssociations = await prisma.user_word_associations.findMany({
      where: { user_id: userId },
      select: { word_id: true, emoji: true, highlight_color: true }
    });

    return userAssociations.reduce((acc, assoc) => {
      acc[assoc.word_id] = { emoji: assoc.emoji, highlightColor: assoc.highlight_color };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user word associations:', error);
    throw error;
  }
};

export { getUserWordAssociations };