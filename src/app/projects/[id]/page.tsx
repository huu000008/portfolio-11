import { getProjectById } from '@/features/projects/api/getProjectById';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/features/projects/components/ProjectDetail';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) return notFound();

  return (
    <>
      <ProjectHeader id={id} />
      <ProjectDetail project={project} />
    </>
  );
}
