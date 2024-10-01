module.exports = (sequelize, DataTypes) => {
    const AreaContent = sequelize.define('AreaContent', {
        area_id: { type: DataTypes.INTEGER, allowNull: false },
        language_id: { type: DataTypes.INTEGER, allowNull: false },
        translated_title: { type: DataTypes.STRING(255), allowNull: false, unique: true }
    }, {
        schema: 'static_content',
        tableName: 'area_content',
        timestamps: false
    });

    AreaContent.associate = function(models) {
        AreaContent.belongsTo(models.Language, { foreignKey: 'language_id', targetKey: 'language_id', schema: 'static_content' });
        AreaContent.belongsTo(models.Area, { foreignKey: 'area_id', targetKey: 'area_id', schema: 'static_content' });
    };

    return AreaContent;
};
