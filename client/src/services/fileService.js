import axios from 'axios';

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('ff_token')}` }
});

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post('/files/upload', formData, {
    ...authHeaders(),
    headers: {
      ...authHeaders().headers,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    }
  });
  return data;
};

export const getJobs = async () => {
  const { data } = await axios.get('/jobs', authHeaders());
  return data;
};

export const getJobById = async (id) => {
  const { data } = await axios.get(`/jobs/${id}`, authHeaders());
  return data;
};

export const downloadOriginal = (fileId, fileName) => {
  const token = localStorage.getItem('ff_token');
  const link = document.createElement('a');
  link.href = `/files/${fileId}/download`;
  link.setAttribute('download', fileName);
  // Use fetch to get with auth then trigger download
  fetch(`/files/${fileId}/download`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
};

export const downloadOutput = (jobId) => {
  const token = localStorage.getItem('ff_token');
  fetch(`/jobs/${jobId}/output`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'output';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      return res.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
};
