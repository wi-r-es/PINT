module.exports = (sequelize, DataTypes) => {
    const SubAreaContent = sequelize.define('SubAreaContent', {
        sub_area_id: { type: DataTypes.INTEGER, allowNull: false },
        language_id: { type: DataTypes.INTEGER, allowNull: false },
        translated_title: { type: DataTypes.STRING(255), allowNull: false, unique: true }
    }, {
        schema: 'static_content',
        tableName: 'sub_area_content',
        timestamps: false
    });

    SubAreaContent.associate = function(models) {
        SubAreaContent.belongsTo(models.Language, { foreignKey: 'language_id', targetKey: 'language_id', schema: 'static_content' });
        SubAreaContent.belongsTo(models.SubArea, { foreignKey: 'sub_area_id', targetKey: 'sub_area_id', schema: 'static_content' });
    };

    return SubAreaContent;
};
