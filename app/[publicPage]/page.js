import { notFound } from "next/navigation";
import PortalPage from "../portal-page";

const publicPages = {
  tentang: "Tentang — Universitas Cakrawala Nusantara",
  "program-studi": "Program Studi — Universitas Cakrawala Nusantara",
  "jalur-masuk": "Jalur Masuk — Universitas Cakrawala Nusantara",
  jadwal: "Jadwal Penerimaan — Universitas Cakrawala Nusantara",
  biaya: "Biaya Pendidikan — Universitas Cakrawala Nusantara"
};

export async function generateMetadata({ params }) {
  const { publicPage } = await params;
  const title = publicPages[publicPage];
  return title ? { title } : {};
}

export default async function PublicInfoPage({ params }) {
  const { publicPage } = await params;
  if (!publicPages[publicPage]) notFound();
  return <PortalPage />;
}
