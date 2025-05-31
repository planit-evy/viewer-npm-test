import type { Meta, StoryObj } from '@storybook/react';
import { AutodeskViewer } from '../components';

const meta: Meta<typeof AutodeskViewer> = {
    title: 'Components/AutodeskViewer',
    component: AutodeskViewer,
    parameters: {
        layout: 'fullscreen',
    },
};
export default meta;

type Story = StoryObj<typeof AutodeskViewer>;

export const Default: Story = {
    args: {
        urn: 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnRMT20wUTMxUmVpcWRXS3lsWUVfcHc_dmVyc2lvbj0yMA',
        accessToken: 'token',
    },
};
