import styles from "./page.module.css";
import AddQuote from "@/components/addQuote";

export default function Home() {
  return (
    <main className={styles.main}>
      <AddQuote />
    </main>
  );
}
