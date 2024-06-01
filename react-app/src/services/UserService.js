import { DaoService } from "./DaoService";

class UserService extends DaoService {

    static getInstance() {
        return super.getInstance('user');
    }

    login(data) {
        return UserService.post(`${this.prefix}/login`, data);
    }

    getCurrentUser() {
        return UserService.get(`${this.prefix}/current`);
    }

    verifyOneTimePassword(data) {
        return UserService.post(`${this.prefix}/verify`, data);
    }

    logout() {
        return UserService.post(`${this.prefix}/logout`);
    }

    verifyEmail(token) {
        return UserService.post(`${this.prefix}/verify-email/${token}`);
    }

    resetPassword(token, data) {
        return UserService.post(`${this.prefix}/reset-password/${token}`, data);
    }

    enable(idOrUid) {
        return UserService.post(`${this.prefix}/${idOrUid}/enable`);
    }

    disable(idOrUid, data) {
        return UserService.post(`${this.prefix}/${idOrUid}/disable`, data);
    }

    changePassword(data) {
        return UserService.post(`${this.prefix}/change-password`, data);
    }

    confirmChangePassword(data) {
        return UserService.post(`${this.prefix}/confirm-change-password`,data);
    }

    forgotPassword(data) {
        return UserService.post(`${this.prefix}/forgot-password`, data);
    }

    linkOrganisations(uid, data) {
        return UserService.post(`${this.prefix}/${uid}/link-organisations`, data);
    }

    findLinkedOrganisations(uid) {
        return UserService.get(`${this.prefix}/${uid}/linked-organisations`);
    }

    linkGroupes(uid, data) {
        return UserService.post(`${this.prefix}/${uid}/link-groupes`, data);
    }

    findLinkedGroupes(uid) {
        return UserService.get(`${this.prefix}/${uid}/linked-groupes`);
    }

    all() {
        return UserService.get(`${this.prefix}/all`);
    }

    getUserIdsAttachedToGroup(uid) {
        return UserService.get(`${this.prefix}/${uid}/ids-attached-groupe`);
    }

    search(data) {
        return UserService.post(`${this.prefix}/search`, data);
    }
    
    getUserIdsAttachedToOrganisation(uid) {
        return UserService.get(`${this.prefix}/${uid}/ids-attached-organisation`);
    }
}

export default UserService;