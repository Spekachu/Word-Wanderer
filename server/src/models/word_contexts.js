import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class word_contexts extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    word_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'words',
        key: 'word_id'
      }
    },
    context_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'contexts',
        key: 'context_id'
      }
    }
  }, {
    sequelize,
    tableName: 'word_contexts',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "word_contexts_pkey",
        unique: true,
        fields: [
          { name: "word_id" },
          { name: "context_id" },
        ]
      },
    ]
  });
  }
}
