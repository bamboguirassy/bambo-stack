import React, { useCallback } from 'react';
import Main from '../../components/layout/Main';
import { Avatar, Button, Card, Col, Divider, Input, Popconfirm, Row, Select, Space, Spin, Tag } from 'antd';
import { useUserContext } from '../../providers/UserProvider';
import UserService from '../../services/UserService';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import { DeleteFilled, EditFilled, EyeFilled, LockFilled, PlusCircleFilled, ReloadOutlined, UnlockFilled } from '@ant-design/icons';
import UserNew from '../../components/user/UserNew';
import UserEdit from '../../components/user/UserEdit';
import { useNavigate } from 'react-router-dom';
import Moment from 'react-moment';
import UnauthorizedMessage from '../../components/utils/UnauthorizedMessage';
import InfiniteTable from '../../components/utils/InfiniteTable';
import { GroupeService } from '../../services/GroupeService';

export default function UserListPage() {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [paginationData, setPaginationData] = React.useState(null);
    const [newModalVisible, setNewModalVisible] = React.useState(false);
    const [updateModalVisible, setUpdateModalVisible] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const { check } = useUserContext();
    const navigate = useNavigate();
    const [loadingMore, setLoadingMore] = React.useState(false);
    // champs filtrage
    const [searchText, setSearchText] = React.useState(null);
    const [groupeIds, setGroupeIds] = React.useState([]);
    const [statut, setStatut] = React.useState('tout');
    const [groupes, setGroupes] = React.useState([]);


    const init = useCallback(() => {
        setLoading(true);
        UserService.getInstance()
            .search({ searchText, groupeIds, statut })
            .then((response) => {
                setPaginationData(response.data);
                setUsers(response.data.data);
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [searchText, groupeIds, statut]);

    React.useEffect(() => {
        if (!check('VIEW-USERS')) {
            return;
        }
        init();
    }, [init, check]);

    React.useEffect(() => {
        GroupeService.getInstance()
            .all()
            .then((response) => {
                setGroupes(response.data);
            }).catch((error) => {
                catchError(error);
            });
    }, []);

    const handleEnable = (idOrUid) => {
        setLoading(true);
        UserService.getInstance()
            .enable(idOrUid)
            .then((response) => {
                Toast.success(response.message);
                setUsers(users => users.map((user) => {
                    if (user.id === idOrUid) {
                        user.enabled = true;
                    }
                    return user;
                }));
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleDisable = (idOrUid) => {
        setLoading(true);
        UserService.getInstance()
            .disable(idOrUid)
            .then((response) => {
                Toast.success(response.message);
                setUsers(users.map((user) => {
                    if (user.id === idOrUid) {
                        user.enabled = false;
                    }
                    return user;
                }));
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleDelete = (idOrUid) => {
        setLoading(true);
        UserService.getInstance()
            .remove(idOrUid)
            .then((response) => {
                Toast.success(response.message);
                setUsers(users => users.filter((user) => user.uid !== idOrUid));
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const openEditModal = (user) => {
        setSelectedUser(user);
        setUpdateModalVisible(true);
    }
    const loadMore = () => {
        if (paginationData.next_page_url) {
            setLoadingMore(true);
            UserService
                .post(paginationData.next_page_url, { searchText, groupeIds, statut })
                .then((response) => {
                    if (!response) {
                        return;
                    }
                    setPaginationData(response.data);
                    setUsers([...users, ...response.data.data]);
                }).catch((error) => {
                    catchError(error);
                })
                .finally(() => {
                    setLoadingMore(false);
                });
        }
    }

    const gotoUserDetails = (user) => {
        navigate(`/parametrage/user/${user.uid}`);
    }

    const columns = [
        {
            title: "Avatar",
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar) => <Avatar size={48} src={avatar} />,
            width: 80,
        },
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: 200,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            width: 250,
        },
        {
            title: 'Statut',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled) => enabled ? <Tag color="green">Activé</Tag> : <Tag color="red">Désactivé</Tag>,
            width: 100,
        },
        {
            title: 'Groupes',
            dataIndex: 'groupes',
            key: 'groupes',
            render: (groupes) => groupes.length ? groupes.map((group, index) => (
                <Tag key={index} color="blue">{group.nom}</Tag>
            )): 'N/A',
            width: 300,
        },
        {
            title: "Créé le",
            dataIndex: 'created_at',
            key: 'created_at',
            width: 100,
            render: (created_at) => <Moment>{created_at}</Moment>,
        },
        {
            title: "Email vérifié",
            dataIndex: 'email_verified_at',
            key: 'email_verified_at',
            width: 120,
            render: (email_verified_at) => email_verified_at ? <Tag color="green"><Moment>{email_verified_at}</Moment></Tag> : <Tag color="red">Non</Tag>,
        },
        {
            title: "Dernière connexion",
            dataIndex: 'last_login_at',
            key: 'last_login_at',
            width: 150,
            render: (last_login) => last_login ? <Moment>{last_login}</Moment> : 'N/A',
        },
        {
            title: "Dernière activité",
            dataIndex: 'last_activity_at',
            key: 'last_activity_at',
            width: 150,
            render: (last_activity) => last_activity ? <Moment>{last_activity}</Moment> : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, user) => (
                <Space>
                    <Button onClick={() => gotoUserDetails(user)} type='primary' icon={<EyeFilled />}></Button>
                    <Button className='btn-warning' onClick={() => openEditModal(user)} icon={<EditFilled />}></Button>
                    {user.enabled ?
                        <Button disabled danger onClick={() => handleDisable(user.id)} icon={<LockFilled />}></Button> :
                        <Button disabled type='dashed' onClick={() => handleEnable(user.id)} icon={<UnlockFilled />}></Button>
                    }
                    {check('DELETE-USER') ? <Popconfirm okType='danger' title="Voulez-vous vraiment supprimer cet utilisateur?" onConfirm={() => handleDelete(user.uid)} okText="Confirmer" cancelText="Annuler">
                        <Button type='primary' danger icon={<DeleteFilled />}></Button>
                    </Popconfirm> : null}
                </Space>
            ),
            width: 200,
        },
    ];

    const handleCreation = (user) => {
        setUsers([user, ...users]);
        setNewModalVisible(false);
    }

    const handleUpdate = (user) => {
        setUsers(users.map((u) => {
            if (u.uid === user.uid) {
                return user;
            }
            return u;
        }));
        setSelectedUser(null);
        setUpdateModalVisible(false);
    }

    return (
        <Main>
            {check('VIEW-USERS') ? <>
                {/* {loading ? <LoadingPlaceholder /> : null} */}
                <Card title="Liste des Utilisateurs" classNames={{ body: "px-0" }}>
                    <Spin spinning={loading}>
                        <InfiniteTable rowKey={'uid'} dataSource={users} paginationData={paginationData} loadMore={loadMore} loading={loadingMore}
                            columns={columns} title={
                                <Row gutter={[24, 16]}>
                                    <Col span={24}>
                                        <Space>
                                            {
                                                check('ADD-USER') ?
                                                    <Button type="primary" icon={<PlusCircleFilled />} onClick={() => setNewModalVisible(true)}>Ajouter un utilisateur</Button>
                                                    : null

                                            }
                                            <Button type='default' icon={<ReloadOutlined />} onClick={init}>Rafraîchir</Button>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Row gutter={[16, 16]} justify={'center'}>
                                            <Col span={24}>
                                                <Divider>Filtres rapides</Divider>
                                            </Col>
                                            <Col xs={24} md={8} lg={6}>
                                                <Input.Search value={searchText} onInput={
                                                    (e) => {
                                                        setSearchText(e.target.value);
                                                    }} placeholder="Rechercher un utilisateur" />
                                            </Col>
                                            <Col xs={24} md={8} lg={6}>
                                                <Select value={groupeIds} onChange={
                                                    (value) => {
                                                        setGroupeIds(value);
                                                    }
                                                }
                                                    allowClear mode='multiple' placeholder="Filtrer par groupe" style={{ width: '100%' }}>
                                                    {groupes.map((groupe) => (
                                                        <Select.Option key={groupe.id} value={groupe.id}>{groupe.nom}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col xs={24} md={8} lg={6}>
                                                <Select value={statut} onChange={
                                                    (value) => {
                                                        setStatut(value);
                                                    }
                                                } placeholder="Filtrer par statut" style={{ width: '100%' }}>
                                                    <Select.Option value="tout">Tous</Select.Option>
                                                    <Select.Option value="actif">Activé</Select.Option>
                                                    <Select.Option value="inactif">Désactivé</Select.Option>
                                                </Select>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            }
                        />
                    </Spin>
                </Card>
                <UserNew
                    visible={newModalVisible}
                    onCreate={handleCreation}
                    onCancel={() => setNewModalVisible(false)}
                />
                {selectedUser ? <UserEdit
                    visible={updateModalVisible}
                    uid={selectedUser.uid}
                    onUpdate={handleUpdate}
                    onCancel={() => setUpdateModalVisible(false)}
                /> : null}
            </> : <UnauthorizedMessage />}
        </Main>
    );
}