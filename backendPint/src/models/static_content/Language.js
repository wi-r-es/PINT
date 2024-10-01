module.exports = (sequelize, DataTypes) => {
    const Language = sequelize.define('Language', {
        language_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        language_code: { type: DataTypes.STRING(2), allowNull: false, unique: true },
        language_name: { type: DataTypes.STRING(30), allowNull: false }
    }, {
        schema: 'static_content',
        tableName: 'language',
        timestamps: false
    });

    return Language;
};
