import semver from 'semver';
import {loadContracts as v0_20_x } from '@/lib/Blockchain/ledgerVersion/0.20.x';
import {loadContracts as v0_23_x} from '@/lib/Blockchain/ledgerVersion/0.23.x';
import {loadContracts as v0_28_x} from '@/lib/Blockchain/ledgerVersion/0.28.x';
import {loadContracts as v0_31_x } from '@/lib/Blockchain/ledgerVersion/0.31.x';


export async function loadContracts(v) {
    if (semver.satisfies(v, '0.20.x - 0.22.x')) {
        return v0_20_x('0.20.5', v);
    } else if (semver.satisfies(v, '0.23.x - 0.27.x')) {
        return v0_23_x(semver.satisfies(v, '0.23.x - 0.26.x') ? '0.23.2' : '0.27.1', v);
    } else if (semver.satisfies(v, '0.28.x')) {
        return v0_28_x('0.28.0', v);
    } else if (semver.satisfies(v, '0.29.x')) {
        return v0_28_x('0.29.0', v);
    } else if (semver.satisfies(v, '0.31.x')) {
        return v0_31_x('0.31.1', v);
    }

    throw new Error(`version ${v} does not supported`);
}
