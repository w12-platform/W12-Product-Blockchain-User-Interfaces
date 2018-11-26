import semver from 'semver';

// by default resolve general version of component
// if there is need to do it for specified component then provide component name and write logic
export function resolveComponentVersion(v, componentName) {
    if (semver.satisfies(v, '0.20.x - 0.22.x')) return '0.20.5';
    if (semver.satisfies(v, '0.23.x - 0.25.x')) return '0.23.2';
    if (semver.satisfies(v, '0.26.x - 0.27.x')) return '0.27.1';
    if (semver.satisfies(v, '0.28.x')) {
        if (componentName === 'Calculator') return '0.28.0';
        if (componentName === 'WhiteListTable') return '0.28.0';
        if (componentName === 'ProjectStages') return '0.28.x';
        return '0.27.1';
    }

    return v;
}
