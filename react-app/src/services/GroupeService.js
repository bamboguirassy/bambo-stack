import { DaoService } from "./DaoService";

export class GroupeService extends DaoService {
    static getInstance() {
        return super.getInstance('groupe');
    }

    getPermissions() {
        return GroupeService.get(`${this.prefix}/permissions`);
    }

    enable(idOrUid) {
        return GroupeService.post(`${this.prefix}/${idOrUid}/enable`);
    }

    disable(idOrUid) {
        return GroupeService.post(`${this.prefix}/${idOrUid}/disable`);
    }

    all() {
        return GroupeService.get(`${this.prefix}/all`);
    }
}