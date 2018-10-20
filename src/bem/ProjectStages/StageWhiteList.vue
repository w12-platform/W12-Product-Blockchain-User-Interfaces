<template>
    <div class="ProjectStages__stage">
        <div class="row align-items-center justify-content-center">
            <div class="col-auto">
                <span class="ProjectDashboard__step-badge step-badge badge badge-pill badge-light">1</span>
            </div>
            <div class="col-sm-4">
                {{ $t('ProjectDashboardStageWhitelist') }}
            </div>
            <div class="col-sm-2 text-center">
                <b-tag type="is-success">{{ $t('ProjectDashboardStageWhitelistStatusWhitelisted') }}</b-tag>
            </div>
            <div class="col-sm text-right"></div>
        </div>
    </div>
</template>