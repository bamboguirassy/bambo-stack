import React from "react";
import UserGroupeService from "../../services/UserGroupeService";
import { catchError } from "../../services/DaoService";
import { useUserContext } from "../../providers/UserProvider";
import { Table, Button, Badge, Card, Space, Typography, Spin, Popconfirm } from 'antd';
import { DeleteOutlined, LoadingOutlined, PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import styles from './UserGroupeList.module.scss';
import AddUsersGroupe from "../groupe/AddUsersGroupe";


const { Title } = Typography;

export default function UserGroupeList({ groupeUid }) {
    const [loading, setLoading] = React.useState(true);
    const [userGroupes, setUserGroupes] = React.useState([]);
    const [userGroupe, setUserGroupe] = React.useState([]);
    const [paginationData, setPaginationData] = React.useState(null);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [newModalVisible, setNewModalVisible] = React.useState(false);

    const { check } = useUserContext();

    const init = React.useCallback(() => {
        if (!groupeUid) {
            return;
        }
        setLoading(true);
        UserGroupeService.getInstance()
            .findByGroupe(groupeUid)
            .then((response) => {
                setPaginationData(response.data);
                setUserGroupes(response.data.data);
            }).catch((error) => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [groupeUid]);

    React.useEffect(() => {
        if (!check('VIEW-GROUP-USERS')) {
            return;
        }
        init();
    }, [init, check, userGroupe]);

    const loadMore = () => {
        if (!paginationData.next_page_url) {
            return;
        }
        setLoading(true);
        UserGroupeService
            .get(paginationData.next_page_url)
            .then((response) => {
                setPaginationData(response.data);
                setUserGroupes([...userGroupes, ...response.data.data]);
            }).catch((error) => {
                catchError(error);
            }).finally(() => {
                setLoading(false);
            });
    }

    const handleDelete = (userGroupe) => {
        setIsDeleting(true);
        UserGroupeService.getInstance()
            .remove(userGroupe.id)
            .then(() => {
                setUserGroupes(userGroupes.filter(ug => ug.id !== userGroupe.id));
            }).catch((error) => {
                catchError(error);
            }).finally(() => {
                setIsDeleting(false);
            });
    }

    const columns = [
        {
            title: 'Nom',
            dataIndex: ['user', 'name'],
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Statut',
            dataIndex: ['user', 'enabled'],
            key: 'enabled',
            render: enabled => (
                <Badge
                    status={enabled ? "success" : "error"}
                    text={enabled ? "Actif" : "Inactif"}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Space>
                    {check('REMOVE-USER-FROM-GROUP') ? <Popconfirm okType="danger" okText="Supprimer" cancelText="Annuler" placement="topRight"
                        title="Voulez-vous vraiment supprimer cet utilisateur du groupe ?" onConfirm={() => handleDelete(record)}>
                        <Button loading={isDeleting}
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm> : null}
                </Space>
            ),
        },
    ];
    const handleAssignUserGroup = (userGroupe) => {
        setUserGroupe(userGroupe);
        setNewModalVisible(false);
    }

    return (
        <div>
            <AddUsersGroupe onSave={handleAssignUserGroup} visible={newModalVisible} onCancel={() => setNewModalVisible(false)} uid={groupeUid} />
            <Card className={styles.userGroupeListCard}
                extra={
                    <Space>
                        {
                            check('ADD-USER-TO-GROUP') ?
                                <Button onClick={() => setNewModalVisible(true)} icon={<PlusCircleOutlined />} type="primary">Ajouter utilisateurs</Button>
                                : null
                        }
                        <Button onClick={init} icon={<ReloadOutlined />} loading={loading} type="default">Actualiser</Button>
                    </Space>
                }
            >
                <Spin spinning={loading}>
                    {check('VIEW-GROUP-USERS') ? (
                        <>
                            <Title level={3}>Utilisateurs du groupe</Title>
                            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                                <Table
                                    columns={columns}
                                    dataSource={userGroupes}
                                    rowKey="uid"
                                    pagination={false}
                                />
                            </Spin>
                            {paginationData?.next_page_url && (
                                <div className={styles.loadMore}>
                                    <Button onClick={loadMore} disabled={!paginationData?.next_page_url}>
                                        Charger plus
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : null}
                </Spin>
            </Card>
        </div>
    );
}
