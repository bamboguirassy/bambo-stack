// UserGroupes.js
import React, { useState, useEffect } from 'react';
import { List, Button, Space } from 'antd';
import { catchError } from '../../services/DaoService';
import UserGroupesForm from './UserGroupesForm';
import { EditFilled, ReloadOutlined } from '@ant-design/icons';
import { useUserContext } from '../../providers/UserProvider';
import UnauthorizedMessage from '../utils/UnauthorizedMessage';
import UserService from '../../services/UserService';

const UserGroupes = ({ userUid }) => {
    const [loading, setLoading] = useState(false);
    const [groupes, setGroupes] = useState([]);
    const [formVisible, setFormVisible] = useState(false);

    const { check } = useUserContext();

    const fetchGroupes = React.useCallback(() => {
        setLoading(true);
        UserService.getInstance()
            .findLinkedGroupes(userUid)
            .then((response) => {
                setGroupes(response.data);
            })
            .catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userUid]);

    useEffect(() => {
        fetchGroupes();
    }, [fetchGroupes]);

    const showForm = () => {
        setFormVisible(true);
    };

    const hideForm = () => {
        setFormVisible(false);
    };

    const handleUpdate = () => {
        fetchGroupes();
        hideForm();
    }

    return (
        <div className='px-2'>
            {check('VIEW-GROUP-USERS') ? (
                <List
                    loading={loading}
                    header={<div>Groupes auxquels l'utilisateur est associé</div>}
                    footer={
                        <Space>
                            {
                                check('ADD-USER-TO-GROUP') ?
                                <Button type="primary" className='btn btn-warning text-dark' icon={<EditFilled />} onClick={showForm}>Assigner des groupes </Button>
                                : null
                            }
                            <Button type="default" icon={<ReloadOutlined />} onClick={fetchGroupes} loading={loading}>Actualiser</Button>
                        </Space>
                    }
                    bordered
                    dataSource={groupes}
                    renderItem={(groupe) => (
                        <List.Item key={groupe.uid}>
                            <List.Item.Meta title={groupe.nom} description={groupe.description} />
                        </List.Item>
                    )}
                />
            ) : (
                <UnauthorizedMessage />
            )}
            {(formVisible && check('ADD-USER-TO-GROUP')) ? (
                <UserGroupesForm visible={formVisible} userId={userUid} onCancel={hideForm} onUpdate={handleUpdate} />
            ) : null}
        </div>
    );
};

export default UserGroupes;