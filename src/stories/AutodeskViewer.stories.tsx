import type { Meta, StoryObj } from '@storybook/react';
import { AutodeskViewer } from '../components';
import { StrictMode } from 'react';

const meta: Meta<typeof AutodeskViewer> = {
  title: 'Components/AutodeskViewer',
  component: AutodeskViewer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <StrictMode>
        <Story />
      </StrictMode>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof AutodeskViewer>;

export const Default: Story = {
  args: {
    urn: [
      'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnRMT20wUTMxUmVpcWRXS3lsWUVfcHc_dmVyc2lvbj0yMA',
      'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnVQb1lPaGZZVDJtRjRJcHVvS0xwTkE_dmVyc2lvbj0y',
    ],
    accessToken: '',
  },
};
