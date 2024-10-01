module.exports = (sequelize, DataTypes) => {
    const Ratings = sequelize.define('Ratings', {
        rating_id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        event_id: { 
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        post_id: { 
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        critic_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        evaluation_date: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP') 
        },
        evaluation: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        }
    }, {
        schema: 'dynamic_content',
        tableName: 'ratings',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['critic_id', 'post_id'],
                name: 'unique_critic_post'
            },
            {
                unique: true,
                fields: ['critic_id', 'event_id'],
                name: 'unique_critic_event'
            }
        ]
    });

    Ratings.associate = function(models) {
        Ratings.belongsTo(models.Posts, { foreignKey: 'post_id', targetKey: 'post_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Ratings.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Ratings.belongsTo(models.Users, { foreignKey: 'critic_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
    };

    return Ratings;
};
