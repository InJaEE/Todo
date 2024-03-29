import App, { AppContext, AppProps, AppInitialProps } from 'next/app';
import { wrapper } from '../store';
import GlobalStyle from '../styles/GlobalStyle';
import Header from '../components/Header';
import Footer from '../components/Footer';

const app = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <GlobalStyle />
            <Header />
            <Component {...pageProps} />
            <Footer />
        </>
    )
}

export default wrapper.withRedux(app);