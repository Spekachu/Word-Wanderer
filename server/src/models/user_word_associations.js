import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class user_word_associations extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      unique: "user_word_associations_user_id_word_id_key"
    },
    word_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'words',
        key: 'word_id'
      },
      unique: "user_word_associations_user_id_word_id_key"
    },
    emoji: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    highlight_color: {
      type: DataTypes.CHAR(7),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user_word_associations',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "idx_user_word_associations_user_word",
        fields: [
          { name: "user_id" },
          { name: "word_id" },
        ]
      },
      {
        name: "user_word_associations_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_word_associations_user_id_word_id_key",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "word_id" },
        ]
      },
    ]
  });
  }
}
