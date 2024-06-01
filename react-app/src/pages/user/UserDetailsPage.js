// UserDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Avatar, Tag, Button, Space, Popconfirm, Row, Col } from 'antd';
import { EditFilled, DeleteFilled, LockFilled, UnlockFilled } from '@ant-design/icons';
import styles from './UserDetailsPage.module.scss';
import Main from '../../components/layout/Main';
import UserService from '../../services/UserService';
import { useUserContext } from '../../providers/UserProvider';
import UserGroupes from '../../components/groupe/UserGroupes';
import LoadingPlaceholder from '../../components/utils/LoadingPlaceholder';
import PieceJointeList from '../../components/piecejointe/PieceJointeList';
import PieceJointeService from '../../services/PieceJointeService';


const UserDetailsPage = () => {
    const { uid } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { check } = useUserContext();

    useEffect(() => {
        if (!check('VIEW-USER')) {
            return;
        }
        UserService.getInstance()
            .find(uid)
            .then(response => {
                setUser(response.data);
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                setLoading(false);
            });
    }, [uid, check]);

    const openEditModal = (user) => {
        console.log('Editing', user);
    };

    const handleDisable = (userId) => {
        console.log('Disabling user with ID', userId);
    };

    const handleEnable = (userId) => {
        console.log('Enabling user with ID', userId);
    };

    const handleDelete = (userId) => {
        console.log('Deleting user with ID', userId);
    };


    return (
        <Main>
            {loading ? (
                <LoadingPlaceholder />
            ) :
                <div className={styles.container}>
                    <Card loading={loading} className={styles.card}>
                        <div className={styles.header}>
                            <Avatar size={100} src={user.avatar} className={styles.avatar} />
                            <div className={styles.info}>
                                <h1 className={styles.name}>{user.name}</h1>
                                <p className={styles.email}>{user.email}</p>
                            </div>
                        </div>
                        <div className={styles.details}>
                            <p><strong>Statut :</strong> {user.enabled ? <Tag color="green">Activé</Tag> : <Tag color="red">Désactivé</Tag>}</p>
                            <div className={styles.actions}>
                                <Space>
                                    <Button disabled onClick={() => openEditModal(user)} type="primary" icon={<EditFilled />}>Éditer</Button>
                                    {user.enabled ? (
                                        <Button disabled onClick={() => handleDisable(user.id)} type="primary" danger icon={<LockFilled />}>Désactiver</Button>
                                    ) : (
                                        <Button disabled onClick={() => handleEnable(user.id)} type="primary" icon={<UnlockFilled />}>Activer</Button>
                                    )}
                                    <Popconfirm title="Voulez-vous vraiment supprimer cet utilisateur?" onConfirm={() => handleDelete(user.id)} okText="Oui" cancelText="Non">
                                        <Button disabled type="primary" danger icon={<DeleteFilled />}>Supprimer</Button>
                                    </Popconfirm>
                                </Space>
                            </div>
                        </div>

                        <Row>
                            <Col sm={24} md={12}>
                                <UserGroupes userUid={user?.uid} />
                            </Col>
                            <Col sm={24} md={12}>
                                {user ? <PieceJointeList parentType={PieceJointeService.TYPES.USER} parentId={user?.id} /> : null}
                            </Col>
                        </Row>
                    </Card>
                </div>
            }
        </Main>
    );
};

export default UserDetailsPage;