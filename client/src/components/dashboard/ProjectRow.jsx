import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

function ProjectRow({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-row">
      <div>
        <h3>{project.title}</h3>
        <p className="meta">{project.clientName}</p>
      </div>
      <div className="meta">Rate {formatPrice(project.hourlyRate)}/hr</div>
      <span
        className={`status-pill ${
          project.status === 'paused' ? 'status-paused' : 'status-active'
        }`}
      >
        {project.status}
      </span>
      <div className="price">{formatPrice(project.totalPrice)}</div>
    </Link>
  );
}

export default ProjectRow;
