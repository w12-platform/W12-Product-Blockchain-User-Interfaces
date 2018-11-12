<template>
    <section class="buefy" v-if="isTestNetwork">
        <b-notification :closable="false" :type="type">{{ $t('CrossPagesNotificationYouUseTestNetwork') }}</b-notification>
    </section>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';

const AccountNS = createNamespacedHelpers('Account');

export default {
    name: 'CrossPagesNotification',
    computed: {
        ...AccountNS.mapState([
            'networkId'
        ]),
        isTestNetwork() {
            if (this.networkId != null) {
                return this.networkId == 4;
            }

            return false;
        },
        type() {
            return this.isTestNetwork ? 'is-info' : null;
        }
    }
}
</script>

<style lang="sass">
</style>
