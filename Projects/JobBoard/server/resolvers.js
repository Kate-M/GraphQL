import { getCompany } from './db/companies.js';
import { 
  getJob,
  getJobs,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
} from './db/jobs.js';

export const resolvers = {
  Query: {
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },    jobs: () => getJobs(),
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError('No Company found with id ' + id);
      }
      return company;
    },

  },
  
  Job: {
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId);
    },
    date: (job) => toIsoDate(job.createdAt),
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },

  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {

      if (!user) {
        throw unauthorizedError('Missing authentication');
      }

      return createJob({ companyId: user.companyId, title, description });
    },

    deleteJob: async (_root, { input: { id } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }

      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }

      return job;
    },

    updateJob: async (_root, { input: { id, title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }

      const job = await updateJob({ id, companyId: user.companyId, title, description });

      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      }
      return job;
    },
  },
};

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
