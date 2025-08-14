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
        accessToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IlZiakZvUzhQU3lYODQyMV95dndvRUdRdFJEa19SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiMEc2S0FLWkdUVFB4YzN4SVJidm1XQWh2MHlDT216d0dLQnVRZGZzR1M2UUdLU0NiIiwiaXNzIjoiaHR0cHM6Ly9kZXZlbG9wZXIuYXBpLmF1dG9kZXNrLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tIiwianRpIjoiUkhMWnJOWUdtMnFra1JxajFQeThzNWwyUk1DZ0k3NTdMNDluTG9QWDhYWHo1cHpLQkdteU5xWHc0akppb1dVdyIsInVzZXJpZCI6IjVNMzNSTVk4V1VDWiIsImV4cCI6MTc1NTE2MTQ1NX0.W_ZsOjcJPZXp1qVAET-OMOc2h7el-8Jp1D3pgGRn1QTzqMrovkiaCfxjBdB4Fd3FYGo6HZYO4nleE8hV0qRSUvzD7KRmgODlZ_Ijap0ZaD1q85lXda6-\n3v972nnkLDMx0nbkWLPINthAxcMb2wbcPTxFLDrUaAsCOcf03M7PXSrLQPhF03PO6mGGCfKAQNsWYBqmhHCVBwz0dA4Nm8F2vVTNaKXkjxtIOUjhRA5kxgKsN3lp2-R5VeW26vQEDHC0XTqx5FbLooQ8Rcltc8X-deOg18JB2b8Lo5Cgq3kOm-p7UV0If3t35BhaSW2P1Pd-ep8jdOOMIwiUIlHiBS5wCw\\",
    },
};
