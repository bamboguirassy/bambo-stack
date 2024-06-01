import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Checkbox, Tabs } from 'antd';
import { GroupeService } from '../../services/GroupeService';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import styles from './GroupeDetails.module.scss';
import { useParams } from 'react-router-dom';
import Main from '../../components/layout/Main';
import UserGroupeList from '../../components/user/UserGroupeList';
import LoadingPlaceholder from '../../components/utils/LoadingPlaceholder';

const { Paragraph, Text, Title } = Typography;

const GroupeDetailsPage = () => {
    const { uid } = useParams();
    const [loading, setLoading] = useState(true);
    const [groupeData, setGroupeData] = useState(null);
    const [permissionsData, setPermissionsData] = useState([]);
    
    useEffect(() => {
        setLoading(true);
        Promise.all([
            GroupeService.getInstance().getPermissions(),
            GroupeService.getInstance().find(uid)
        ]).then(([permissionsResponse, groupeResponse]) => {
            setPermissionsData(permissionsResponse.data);
            setGroupeData(groupeResponse.data);
        }).catch(error => {
            catchError(error);
            Toast.error('Erreur lors du chargement des données.');
        }).finally(() => {
            setLoading(false);
        });
    }, [uid]);

    const tabItems = [
        {
            key: 'permissions',
            label: 'Permissions',
            children: (
                <Row>
                        <Col span={24}>
                            <Title level={4}>Permissions</Title>
                            {permissionsData.map((group) => (
                                <div key={group.code} className={styles.permissionsGroup}>
                                    <Title level={5}>{group.nom}</Title>
                                    <Row>
                                        {group.permissions.map(permission => (
                                            <Col span={12} key={permission.code}>
                                                <Checkbox checked={groupeData.permissions.includes(permission.code)} disabled>
                                                    {permission.nom}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            ))}
                        </Col>
                    </Row>
            )
        },
        {
            key: 'users',
            label: 'Utilisateurs',
            children: <UserGroupeList groupeUid={uid} />
        }
    ];


    return (
        <Main>
            {loading ? <LoadingPlaceholder /> : 
            (<Card className={styles.groupeDetailsCard}>
                <Title level={2}>Détails du groupe</Title>
                <Card>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Paragraph>
                                <Text strong>Nom :</Text> {groupeData.nom}
                            </Paragraph>
                        </Col>
                        <Col xs={24} md={12}>
                            <Paragraph>
                                <Text strong>Code :</Text> {groupeData.code}
                            </Paragraph>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Paragraph>
                                <Text strong>Description :</Text> {groupeData.description}
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
                <Card bordered>
                    <Tabs defaultActiveKey="permissions" items={tabItems} />
                </Card>
            </Card>)}
        </Main>
    );
};

export default GroupeDetailsPage;
