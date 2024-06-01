import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Card } from 'antd';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import { GroupeService } from '../../services/GroupeService';
import UserService from '../../services/UserService';

const UserEdit = ({ visible, uid, onUpdate, onCancel }) => {
    const [form] = Form.useForm();
    const [groupes, setGroupes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);

    useEffect(() => {
        setLoading(true);

    }, []); // Assurez-vous de déclencher cet effet uniquement lorsque la modal devient visible

    React.useEffect(() => {
        if (!visible) return;
        setLoading(true);
        Promise.all([UserService.getInstance().find(uid), GroupeService.getInstance().all()])
            .then(([userResponse, groupesResponse]) => {
                // Préremplir le formulaire avec les données de l'utilisateur
                form.setFieldsValue(userResponse.data);
                setSelectedGroups(userResponse.data.groupes.map(group => group.id));
                setGroupes(groupesResponse.data);
            }).catch((error) => {
                catchError(error);
            }).finally(() => {
                setLoading(false);
            });
    }, [uid, visible, form]);


    const onFinish = (values) => {
        values.groupeIds = selectedGroups;
        setLoading(true);
        UserService.getInstance()
            .update(uid, values)
            .then((response) => {
                Toast.success(response.message);
                onUpdate(response.data);
            }).catch((error) => {
                catchError(error);
            }).finally(() => {
                setLoading(false);
            });
    };

    const onCheckGroupChange = (checkedValues) => {
        setSelectedGroups(checkedValues);
    };

    return (
        <Modal
            open={visible}
            title="Modifier l'utilisateur"
            okText="Enregistrer"
            cancelText="Annuler"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then((values) => {
                    onFinish(values);
                }).catch((info) => {
                    console.log('Validate Failed:', info);
                });
            }}
        >
            <Card loading={loading} style={{ marginBottom: 20 }}>
                <Form layout='vertical' form={form}>
                    <Row gutter={24}>
                        <Col xs={24} md={24}>
                            <Form.Item
                                label="Nom"
                                name="name"
                                rules={[
                                    { required: true, message: 'Veuillez saisir le nom!' },
                                    { min: 3, message: 'Le nom doit contenir au moins 3 caractères!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Veuillez saisir l\'adresse email!' },
                                    { type: 'email', message: 'Veuillez saisir une adresse email valide!' }
                                ]}
                            >
                                <Input disabled type="email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Groupes">
                        <Checkbox.Group defaultValue={selectedGroups} options={groupes.map(group => ({ label: group.nom, value: group.id }))} onChange={onCheckGroupChange} />
                    </Form.Item>
                </Form>
            </Card>
        </Modal>
    );
};

export default UserEdit;
