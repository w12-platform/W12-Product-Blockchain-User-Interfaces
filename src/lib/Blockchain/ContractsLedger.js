import semver from 'semver';
import {loadContracts as v0_20_x } from '@/lib/Blockchain/ledgerVersion/0.20.x';
import {loadContracts as v0_23_x} from '@/lib/Blockchain/ledgerVersion/0.23.x';
import {loadContracts as v0_28_x} from '@/lib/Blockchain/ledgerVersion/0.28.x';


export async function loadContracts(v) {
    if (semver.satisfies(v, '0.20.x - 0.22.x')) {
        return v0_20_x(v);
    } else if (semver.satisfies(v, '0.23.x - 0.27.x')) {
        return v0_23_x(v);
    } else if (semver.satisfies(v, '0.28.x')) {
        return v0_28_x(v);
    }

    throw new Error(`version ${v} does not supported`);
}
