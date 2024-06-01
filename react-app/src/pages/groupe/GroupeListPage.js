import React, { useCallback } from 'react';
import { Button, Card, Popconfirm, Space, Spin, Tag } from 'antd';
import { GroupeService } from '../../services/GroupeService';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import Main from '../../components/layout/Main';
import { DeleteFilled, EditOutlined, EyeFilled, LockFilled, PlusCircleFilled, ReloadOutlined, UnlockFilled } from '@ant-design/icons';
import GroupeNew from '../../components/groupe/GroupeNew';
import GroupeEdit from '../../components/groupe/GroupeEdit';
import { useUserContext } from '../../providers/UserProvider';
import UnauthorizedMessage from '../../components/utils/UnauthorizedMessage';
import { Link } from 'react-router-dom';
import InfiniteTable from '../../components/utils/InfiniteTable';


export default function GroupeListPage() {
    const [loading, setLoading] = React.useState(true);
    const [groupes, setGroupes] = React.useState([]);
    const [paginationData, setPaginationData] = React.useState(null);
    const [hasMore, setHasMore] = React.useState(true);
    const [newModalVisible, setNewModalVisible] = React.useState(false);
    const [updateModalVisible, setUpdateModalVisible] = React.useState(false);
    const [selectedGroupe, setSelectedGroupe] = React.useState(null);
    const { check } = useUserContext();
    const [isUserStateChanging, setIsUserStateChanging] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const init = useCallback(() => {
        setLoading(true);
        GroupeService.getInstance()
            .findAll()
            .then((response) => {
                setPaginationData(response.data);
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    React.useEffect(() => {
        if (!check('VIEW-GROUPS')) {
            return;
        }
        init();
    }, [init, check]);



    React.useEffect(() => {
        if (paginationData) {
            // merge the new data with the old data without duplicates (if any)
            setGroupes(groupes => [...new Map([...groupes, ...paginationData.data].map(item => [item['id'], item])).values()]);

            setHasMore(paginationData.next_page_url != null);
        } else {
            setHasMore(false);
        }
    }, [paginationData]);

    const handleEnable = (idOrUid) => {
        setIsUserStateChanging(true);
        GroupeService.getInstance()
            .enable(idOrUid)
            .then((response) => {
                Toast.success(response.message);
                setGroupes(groupes.map((groupe) => {
                    if (groupe.uid === idOrUid) {
                        groupe.enabled = true;
                    }
                    return groupe;
                }));
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setIsUserStateChanging(false);
            });
    }

    const removeItem = (groupe) => {
        setIsDeleting(true);
        GroupeService.getInstance()
            .remove(groupe.uid)
            .then(() => {
                setGroupes(groupes.filter(g => g.id !== groupe.id));
            }).catch(error => {
                catchError(error);
            }).finally(() => {
                setIsDeleting(false);
            });
    }

    const handleDisable = (idOrUid) => {
        setIsUserStateChanging(true);
        GroupeService.getInstance()
            .disable(idOrUid)
            .then((response) => {
                Toast.success(response.message);
                setGroupes(groupes.map((groupe) => {
                    if (groupe.uid === idOrUid) {
                        groupe.enabled = false;
                    }
                    return groupe;
                }));
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setIsUserStateChanging(false);
            });
    }

    const openEditModal = (groupe) => {
        setSelectedGroupe(groupe);
        setUpdateModalVisible(true);
    }

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
            sorter: true,
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 80,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 150,
            ellipsis: true,
            // rendre le texte en plusieurs lignes
            render: (text) => (
                <div style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    wordBreak: 'break-all',
                    maxWidth: 200
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Activé',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled) => enabled ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>,
            width: 50,
        },
        {
            title: "Permissions",
            dataIndex: 'permissions_count',
            key: 'permissions_count',
            sorter: true,
            width: 80,
            render: (count) => <Tag color='cyan'>{count} permission(s)</Tag>
        },
        {
            title: "Utilisateurs",
            dataIndex: 'users_count',
            key: 'users_count',
            sorter: true,
            width: 80,
            render: (count) => <Tag color='cyan'>{count} utilisateur(s)</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    {check('VIEW-GROUP') ?
                        <Link to={`/parametrage/groupe/${record.uid}`}>
                            <Button type="primary" icon={<EyeFilled />}></Button>
                        </Link>
                        : null}
                    {check('ENABLE-DISABLE-GROUP') ? <>
                        {!record.enabled ? <Button loading={isUserStateChanging} icon={<UnlockFilled />} type="primary" onClick={() => handleEnable(record.uid)}></Button> :
                            <Button loading={isUserStateChanging} icon={<LockFilled />} type="primary" danger onClick={() => handleDisable(record.uid)}></Button>}
                    </> : null
                    }
                    {check('EDIT-GROUP') ? <Button onClick={() => openEditModal(record)} type="default" className='btn-warning' icon={<EditOutlined />}></Button> : null}
                    {check('DELETE-GROUP') ? (<Popconfirm title="Voulez-vous vraiment supprimer ce groupe?" onConfirm={() => { removeItem(record) }} okText="Supprimer" cancelText="Annuler" okType="danger">
                        <Button loading={isDeleting} type="primary" danger icon={<DeleteFilled />}></Button>
                    </Popconfirm>) : null}
                </Space>
            ),
            width: 100,
        }
    ];

    const loadMore = () => {
        if (hasMore) {
            setIsLoadingMore(true);
            GroupeService.get(paginationData.next_page_url)
                .then((response) => {
                    if (response) {
                        setPaginationData(response.data);
                    }
                }).catch((error) => {
                    catchError(error);
                }).finally(() => {
                    setIsLoadingMore(false);
                });
        }
    }

    const onCreateConfirm = (groupe) => {
        setGroupes(groupes => [...groupes, groupe]);
        setNewModalVisible(false);
    }

    const onCreateCancel = () => {
        setNewModalVisible(false);
    }

    const onUpdateConfirm = (groupe) => {
        setGroupes(groupes.map(g => {
            if (g.id === groupe.id) {
                return groupe;
            }
            return g;
        }));
        setUpdateModalVisible(false);
    }

    const onUpdateCancel = () => {
        setUpdateModalVisible(false);
    }

    return (
        <Main>
            {check('VIEW-GROUPS') ?
                (
                    <>
                        <GroupeNew visible={newModalVisible} onCreate={onCreateConfirm} onCancel={onCreateCancel} />
                        {selectedGroupe ? <GroupeEdit visible={updateModalVisible} uid={selectedGroupe.uid} onUpdate={onUpdateConfirm} onCancel={onUpdateCancel} /> : null}
                        <Card title={`Liste des groupes`} classNames={{ body: "px-0" }}>
                            <Spin spinning={loading}>
                                <InfiniteTable rowKey={'uid'} dataSource={groupes} loading={loading || isLoadingMore} columns={columns} loadMore={loadMore} paginationData={paginationData}
                                    title={
                                        <Space>
                                            {check('ADD-GROUP') ?
                                                <Button type="primary" icon={<PlusCircleFilled />} onClick={() => setNewModalVisible(true)}>Ajouter un groupe</Button>
                                                : null}
                                            {/* refresh button  */}
                                            <Button loading={loading} type="default" icon={<ReloadOutlined />} onClick={init}>Rafraîchir</Button>
                                        </Space>
                                    }
                                />
                            </Spin>
                        </Card>
                    </>
                )
                : <UnauthorizedMessage />}

        </Main>
    );
}