'use client';

import { Project } from '@/types/project';
import { SafeHtml } from '@/components/ui/SafeHtml';
import styles from './ProjectDetail.module.scss';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface ProjectDetailProps {
  project: Project;
}

const formatDateKST = (dateStr: string) => {
  const date = new Date(dateStr);
  const zoned = toZonedTime(date, 'Asia/Seoul');
  return format(zoned, 'yyyy-MM-dd');
};

export const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const formatPeriod = (period: string) => {
    if (!period.includes('~')) return period;
    const [from, to] = period.split('~').map(d => d.trim());
    return `${formatDateKST(from)} ~ ${formatDateKST(to)}`;
  };

  return (
    <div className={styles.wrap}>
      <h2>{project.title}</h2>
      <div className={styles.date}>{formatDateKST(project.created_at)}</div>

      <div className={styles.info}>
        <div className={styles.label}>설명</div>
        <div className={styles.value}>{project.description}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>⏳ 프로젝트 기간</div>
        <div className={styles.value}>{formatPeriod(project.project_period)}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>👥 팀 구성</div>
        <div className={styles.value}>{project.team}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>🧩 맡은 역할</div>
        <div className={styles.value}>{project.roles}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>🛠️ 사용한 기술 스택</div>
        <div className={styles.value}>
          {project.tech_stack?.map(tech => <span key={tech}>{tech}</span>)}
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>🌟 주요 기여</div>
        <div className={styles.value}>{project.contributions}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>🏆 프로젝트 성과</div>
        <div className={styles.value}>{project.achievements}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.label}>💡 회고 & 느낀 점</div>
        <div className={styles.value}>{project.retrospective}</div>
      </div>
    </div>
  );
};
