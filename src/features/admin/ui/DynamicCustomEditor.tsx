import dynamic from 'next/dynamic';

const DynamicCustomEditor = dynamic(() => import('@/src/shared/ui/ckeditor5/CustomEditor').then(mod => mod.CustomEditor), { ssr: false });

export default DynamicCustomEditor;