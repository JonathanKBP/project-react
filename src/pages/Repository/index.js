import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaSpinner, FaArrowAltCircleLeft } from 'react-icons/fa';
import { ThemeProvider } from 'styled-components';
import api from '../../services/api';

import logo from '../../assets/logo.svg';
import logoDark from '../../assets/logoDark.svg';
import { Loading, Owner, IssueList, Header } from './styles';
import GlobalStyle from '../../styles/global';
import light from '../../styles/themes/light';
import dark from '../../styles/themes/dark';
import Container from '../../components/Container';
import usePersistedState from '../../hooks/usePersistedState';

const Repository = (props) => {
  const [theme] = usePersistedState('theme', light);
  const [repository, setRepository] = useState();
  const [issues, setIssues] = useState();
  const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   setTheme(localStorage.getItem('theme'));
  // }, [theme]);
  // const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const { match } = props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repositoryData, issuesData] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);
    setRepository(repositoryData.data);
    setIssues(issuesData.data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Loading loading={loading}>
        <p>Carregando</p>
        <FaSpinner size={35} />
      </Loading>
    );
  }

  return (
    <ThemeProvider theme={theme.title === 'light' ? light : dark}>
      <GlobalStyle />
      <Header>
        <img
          src={theme.title === 'light' ? logo : logoDark}
          alt="Github Explorer"
        />

        <Link to="/">
          <FaArrowAltCircleLeft size={20} />
          <p>Voltar</p>
        </Link>
      </Header>

      <Container>
        <Owner>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url} target="avatar_url">
                    {issue.title}
                  </a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    </ThemeProvider>
  );
};
export default Repository;
Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
