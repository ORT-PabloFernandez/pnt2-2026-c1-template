import Link from "next/link";
import styles from "./HeaderNew.module.css";

export default function HeaderNew() {
  return (
    <header className={styles["header-new"]}>
      <div className={styles["header-new__left"]}>
        <Link href="/" className={styles["header-new__logo"]}>
          <span className={`material-symbols-outlined ${styles["header-new__logo-icon"]}`}>
            group_work
          </span>
          <h2 className={styles["header-new__logo-text"]}>HubConnect</h2>
        </Link>

        <nav className={styles["header-new__nav"]}>
          <Link
            href="/"
            className={`${styles["header-new__nav-link"]} ${styles["header-new__nav-link--active"]}`}
          >
            Directory
          </Link>
          <a href="#" className={styles["header-new__nav-link"]}>
            Teams
          </a>
          <a href="#" className={styles["header-new__nav-link"]}>
            Projects
          </a>
          <a href="#" className={styles["header-new__nav-link"]}>
            Insights
          </a>
        </nav>
      </div>

      <div className={styles["header-new__right"]}>
        <div className={styles["header-new__search"]}>
          <span className={`material-symbols-outlined ${styles["header-new__search-icon"]}`}>
            search
          </span>
          <input
            className={styles["header-new__search-input"]}
            placeholder="Find a team member..."
            type="text"
          />
        </div>

        <div className={styles["header-new__actions"]}>
          <button className={styles["header-new__action-btn"]}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className={styles["header-new__action-btn"]}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <img
          className={styles["header-new__avatar"]}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1rTaRr9kGD3A_1xu71HkvhhqppJ0W3G3robgL9hDj7iCGqM3NU_5IFXSsVsQwUcDs_WdsoWWCkEiEu2CqE5RplLM4QeMAo234mhnfarwYyRVtXbAOXTkEBMshHBHCYXcsWj-yHtmhZFPnW4PdDx2a-Txr5_xrACQj33x8Ho__d53OddV0Tovu4sNV2NRU_XYwkhCaP1qdNTBg6mvktQ9KsaN-RrPpoWayuZD01MQVvZShuHbKm1GM59dFX7fZvahHpBp7Tt_U-X0"
          alt="Profile picture"
        />
      </div>
    </header>
  );
}
