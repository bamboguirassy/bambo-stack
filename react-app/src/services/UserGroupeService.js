import { DaoService } from "./DaoService";

export default class UserGroupeService extends DaoService {
    static getInstance() {
        return super.getInstance('usergroupe');
    }

    findByGroupe(groupeUid) {
        return UserGroupeService.get(`${this.prefix}/${groupeUid}/groupe`);
    }
    linkUsersToGroupe(uid, data) {
        return UserGroupeService.post(`${this.prefix}/${uid}/users`, data);
    }
}