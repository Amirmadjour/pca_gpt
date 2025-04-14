"use client";

import {
  ChevronRight,
  Settings,
  Plus,
  ArrowUp,
  ChevronLeft,
} from "lucide-react";
import Logo from "@/assets/icons/MadabinaLogo.svg";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  Key,
  useEffect,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Roboto_Mono } from "next/font/google";
import { Label } from "@/components/ui/label";
import ScatterPlot from "./ScatterChart";
import ScatterCirclePlot from "./ScatterCircleChart";
import axios from "axios";
import { BlockMath, InlineMath } from "react-katex";

import "katex/dist/katex.min.css";
import MarkdownTypewriter from "./MarkDownTypeWriter";

const roboto_mono = Roboto_Mono({ subsets: ["latin"] });

export default function Home() {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isConversation, setIsConversation] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reponse, setReponse] = useState<any>("");
  const [header, setHeader] = useState<string>("");
  const [isUsingKaiser, setIsUsingKaiser] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatLambdasKaTeX(lambdas: any[]) {
    return lambdas
      .map((lambda, index) => `\\lambda_{${index + 1}} = ${lambda}`)
      .join(" > ");
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    }
  };

  const handleButtonClick = () => {
    console.log(fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleStartConversation = async () => {
    setIsConversation(true);
    setMessage(query);
    if (selectedFile) {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/perform-pca/",
          {
            pca_type:
              query.toLowerCase() == "normé"
                ? "normalized"
                : query.toLowerCase() == "hétérogène"
                ? "heterogeneous"
                : "homogeneous",
          }
        );
        console.log("Upload successful:", response.data);
        const dataToBeSet = response.data;
        setReponse(response.data);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else {
      await handleTestData();
    }
    setQuery("");
  };

  function determinePCAType(
    text: string,
    data: any
  ): "normé" | "hétérogène" | "homogène" | "inconnu" {
    const normalizedWords = [
      "normé",
      "norme",
      "variance",
      "standardisation",
      "correlation",
    ];
    const heterogeneousWords = [
      "hétérogène",
      "heterogene",
      "non-standardisé",
      "échelle différente",
      "variance forte",
    ];
    const homogeneousWords = [
      "homogène",
      "homogene",
      "même unité",
      "même échelle",
      "covariance",
    ];

    const kaiserWords = ["kaiser"];

    const lowerText = text.toLowerCase();

    if (normalizedWords.some((word) => lowerText.includes(word))) {
      if (kaiserWords.some((word) => lowerText.includes(word))) {
        setIsUsingKaiser(true);
        setHeader("ACP Normé avec Kaiser");
        return data.normalized_kaiser;
      }
      setHeader("ACP Normé sans Kaiser");
      return data.normalized;
    }
    if (heterogeneousWords.some((word) => lowerText.includes(word))) {
      if (kaiserWords.some((word) => lowerText.includes(word))) {
        setIsUsingKaiser(true);
        setHeader("ACP hétérogène avec Kaiser");
        return data.heterogeneous_kaiser;
      }
      setHeader("ACP hétérogène sans Kaiser");
      return data.heterogeneous;
    }
    if (homogeneousWords.some((word) => lowerText.includes(word))) {
      if (kaiserWords.some((word) => lowerText.includes(word))) {
        setHeader("Y'a pas une acp homogène avec critère de kaiser");
        return "inconnu";
      }
      setHeader("ACP homogène");
      return data.homogeneous;
    }
    return "inconnu";
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload-csv-data/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleTestData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/test-example/"
      );
      const dataToBeSet = response.data.results;
      setReponse(determinePCAType(query, dataToBeSet));
      console.log("sucessful test data:", response.data);
    } catch (error) {
      console.error("failed test data:", error);
    }
  };

  const QualiteRepresentation = ({ qualites }: { qualites: any[] }) => {
    return (
      <div className="space-y-4">
        {qualites.length > 0 ? (
          qualites.map((q, index) => (
            <BlockMath key={index}>{`Q_{${index + 1}} = ${q}\\%`}</BlockMath>
          ))
        ) : (
          <p>Aucune qualité de représentation {"<"} 80%</p>
        )}
      </div>
    );
  };

  const GenerateTable = ({ title, table }: { title: string; table: any }) => {
    return (
      <div className="p-6 rounded-lg">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th
                className="p-3 border border-gray-300"
                colSpan={table[0].length}
              >
                {title}
              </th>
            </tr>
          </thead>

          <tbody>
            {table.map((row: any[], index: Key | null | undefined) => (
              <tr key={index} className="hover:bg-white/40 transition-colors">
                {row.map((cell, index) => (
                  <td key={index} className="p-3 border border-gray-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  function matrixToLatex(matrix: any) {
    const rows = matrix.map((row: any[]) => row.join(" & ")).join(" \\\\\n");
    return `\\begin{bmatrix}\n${rows}\n\\end{bmatrix}`;
  }

  useEffect(() => {
    if (selectedFile) {
      handleUpload();
    }
  }, [selectedFile]);

  function generateText({ data }: { data: any[] }): string {
    let text = "";

    for (const [variable, details] of Object.entries(data)) {
      text += `Variable: ${variable}\n`;

      details.physical_meaning.forEach(
        (
          meaning: {
            axis: any;
            meaning: any;
            contribution: number;
            correlation: number;
            quality: any;
          },
          index: number
        ) => {
          text += `  Detail ${index + 1}:\n`;
          text += `  - Axe: ${meaning.axis}\n`;
          text += `  - Sens: ${meaning.meaning}\n`;
          text += `  - Contribution: ${(meaning.contribution * 100).toFixed(
            1
          )}%\n`;
          text += `  - Correlation: ${(meaning.correlation * 100).toFixed(
            1
          )}%\n`;
          text += `  - Qualité: ${meaning.quality}\n`;
        }
      );

      text += "\n";
    }

    return text;
  }

  const generateMeans = ({ data }: { data: any[] }) => {
    return data.map((moy, index) => (
      <BlockMath key={index}>{`Moy(C_{${index + 1}}) = ${moy.toFixed(
        2
      )}`}</BlockMath>
    ));
  };

  const generateVariance = ({ data }: { data: any[] }) => {
    return data.map((moy, index) => (
      <BlockMath key={index}>{`Var(C_{${index + 1}}) = ${moy.toFixed(
        2
      )}`}</BlockMath>
    ));
  };

  function generateCovarianceLatex(matrix: number[][]): string {
    if (matrix.length === 0) return "\\begin{bmatrix} \\end{bmatrix}";

    const labels = matrix.map((_, i) => `C${i + 1}`);

    const latex = matrix
      .map((row, i) =>
        row
          .map((num, j) =>
            i === j
              ? `\\text{Var}(${labels[i]}) = ${num.toFixed(2)}`
              : `\\text{Cov}(${labels[i]}, ${labels[j]}) = ${num.toFixed(2)}`
          )
          .join(" & ")
      )
      .join(" \\\\ ");

    return `\\begin{bmatrix} ${latex} \\end{bmatrix}`;
  }

  return (
    <div
      className={clsx(
        "flex gap-5 h-screen w-screen font-medium text-base overflow-hidden",
        roboto_mono.className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleFileChange}
      />

      <nav
        className={clsx(
          "h-full w-fit py-6 px-4 flex flex-col items-center justify-between bg-card",
          open && "w-40"
        )}
      >
        <div
          className={clsx(
            "flex flex-col items-center justify-center gap-7",
            open && "flex-start"
          )}
        >
          <Image src={Logo} alt="Madabina Logo" width={36} height={36} />
          <button
            onClick={() => setOpen(!open)}
            className="border-[2.5px] border-foreground rounded-md"
          >
            {open ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
          </button>
        </div>
        <Settings size={28} />
      </nav>
      <main className="flex flex-col items-center justify-center flex-1 p-5">
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[750px] h-full">
          {isConversation ? (
            <div className="flex flex-col h-full w-full gap-5">
              <h2 className="font-bold text-xl text-center">
                New chat about the pca
              </h2>
              <div className="relative h-[calc(100vh-200px)] w-full flex flex-col gap-6">
                <div className="bg-card w-fit py-2 px-4 max-w-[600px] rounded-2xl self-end">
                  {message}
                </div>
                <div className="py-3 w-full rounded-2xl overflow-scroll hide-scrollbar typewriter">
                  <Image
                    src={Logo}
                    alt="Madabina Logo"
                    width={44}
                    height={44}
                    className="absolute -left-14 top-16 border p-2 rounded-full"
                  />
                  {typeof reponse == "string" ? (
                    header.length != 0 ? (
                      <h1 className="text-2xl font-bold">{header}</h1>
                    ) : (
                      <p>J'ai pas compris ta question 😅​</p>
                    )
                  ) : (
                    <>
                      <div className="w-full">
                        {/* <MarkdownTypewriter
                          content={`
# Analyse en Composantes Principales (ACP) 
**ACP** est une technique de réduction de dimensionnalité utilisée pour transformer des données de haute dimension en un espace de dimension inférieure tout en préservant autant de variance que possible.

This is a **Markdown** document with a typewriter effect.

***

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

## Features
- Typewriter animation for text
- Support for **bold**, *italic*, and \`code\`
- Lists and tables (with remark-gfm)

{{GenerateTable({title: "Données originales", table: data.data_original})}}


{{GenerateTable({title: "Données centrées", table: data.data_centered})}}

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

  `}
                          delay={0.2}
                          duration={1}
                          data={reponse}
                        /> */}
                      </div>
                      {/* <ScatterPlot />
                      <ScatterCirclePlot /> */}
                      <h1 className="text-2xl font-bold">{header}</h1>
                      <strong>
                        Analyse en Composantes Principales (ACP)
                      </strong>{" "}
                      est une technique de réduction de dimensionnalité utilisée
                      pour transformer des données de haute dimension en un
                      espace de dimension inférieure tout en préservant autant
                      de variance que possible.
                      <br />
                      <br />
                      <strong>Étape 0 : Données d'entrée</strong>
                      <br />
                      Commencez avec un ensemble de données de <code>
                        n
                      </code>{" "}
                      individus (lignes) et <code>p</code> variables (colonnes).
                      {GenerateTable({
                        title: "Données originales",
                        table: reponse.data_original,
                      })}
                      <br />
                      <br />
                      <strong>Étape 1 : Centrer les données</strong>
                      <br />
                      <BlockMath math="X_{\text{centré}} = X - \bar{X}" />
                      Calculez la moyenne de chaque variable et soustrayez-la
                      des données pour les centrer.
                      {GenerateTable({
                        title: "Données centrées",
                        table: reponse.data_centered,
                      })}
                      <strong>
                        Étape 2 : Calculer la matrice de variance-covariance
                      </strong>
                      <BlockMath math="V = \frac{1}{N} X X^T" />
                      <br />
                      Calculez la matrice de variance-covariance <code>
                        C
                      </code>{" "}
                      des données centrées.
                      <br />
                      <br />
                      <BlockMath
                        math={matrixToLatex(reponse.variance_matrix)}
                      />
                      <br />
                      <br />
                      <strong>Étape 3 : Déterminer la métrique</strong>
                      <BlockMath
                        math="M = 
                      \begin{cases} 
                      1 \\ 
                      D_{\frac{1}{\sigma^2}} 
                      \end{cases}
                      "
                      />
                      <br />
                      Calculez la matrice de métrique <code>M</code> des
                      données.
                      <br />
                      <br />
                      <BlockMath math={matrixToLatex(reponse.metric)} />
                      <br />
                      <br />
                      <strong>
                        Étape 4 : Recherche des axes principaux{" "}
                        <InlineMath math="U_{\text{k}}" /> de la matrice{" "}
                        <InlineMath math="(VM)" />
                      </strong>
                      <br />
                      <ul>
                        <li>
                          Calculer le valeurs propres:{" "}
                          <InlineMath math="Dét(VM - \lambda I) = 0" />
                        </li>
                        <li>
                          Trier les valeurs propres par order décroissant:{" "}
                          <InlineMath math="\lambda_{\text{1}} > \lambda_{\text{2}} > ... > \lambda_{\text{n}}" />
                        </li>
                      </ul>
                      <BlockMath
                        math={formatLambdasKaTeX(reponse.eigenvalues)}
                      />
                      <br />
                      {!isUsingKaiser ? (
                        <>
                          <strong>
                            Étape 5 : Calculer la qualité de représentation
                          </strong>
                          <BlockMath math="Q_j = \frac{\sum_{i=1}^{j} \lambda_i}{\sum_{i=1}^{p} \lambda_i} \geq 80\%" />
                          <br />
                          <br />
                          <QualiteRepresentation
                            qualites={reponse.inertia.cumulative_percent}
                          />
                          <br />
                          <br />
                        </>
                      ) : (
                        <>
                          <strong>
                            Étape 5 : Critere kaiser, les valuers propres qui
                            sont superieur a 1
                          </strong>
                          <br />
                          <br />
                        </>
                      )}
                      <strong>
                        Étape 6 : Calculer les vecteurs propres{" "}
                        <InlineMath math="U_k" /> en utilisant la formule{" "}
                        <InlineMath math="V M U_k = \lambda_k U_k" />
                      </strong>
                      <br />
                      <br />
                      <BlockMath math={matrixToLatex(reponse.eigenvectors)} />
                      <br />
                      <br />
                      <strong>
                        Étape 7 : Calculer les composantes principales{" "}
                        <InlineMath math="C_k^i = \lt X_i,U_k \gt_M = X_i^t M U_k" />{" "}
                        et <InlineMath math="C_k = X M U_k" />{" "}
                      </strong>
                      <br />
                      <br />
                      <BlockMath
                        math={matrixToLatex(reponse.principal_components)}
                      />
                      <br />
                      <br />
                      <strong>
                        Étape 8 : Représenter graphiquement les individus dans
                        l'espace réduit en utilisant les composantes principales
                      </strong>
                      <br />
                      <br />
                      <ScatterPlot matrix={reponse.principal_components} />
                      <br />
                      <br />
                      <strong>
                        Étape 9 : Contributions relative aux inerties{" "}
                      </strong>
                      <ul>
                        <li>
                          Part de l'inertie de <InlineMath math="X_i" /> prise
                          en compte par l'axe{" "}
                          <InlineMath math="U_k = \cos(\theta_{ik})^2 = \frac{(C_k^i)^2}{||X_i||_M^2}" />
                        </li>
                        <br />
                        <br />
                        <BlockMath
                          math={matrixToLatex(reponse.cos2.individuals)}
                        />
                        <br />
                        <br />
                        <li>
                          Contribution relative de l'individus{" "}
                          <InlineMath math="X_i" /> à l'inertie expliquée de
                          l'axe <InlineMath math="U_k" />:
                          <BlockMath math="p_{ik} = \frac{p_i(C_k^i)^2}{\Sigma_{i=1}^np_i(C_k^i)^2} = \frac{p_i(C_k^i)^2}{Var(C_k)} = \frac{p_i(C_k^i)^2}{\lambda_k}" />
                        </li>
                        <li>
                          Individuels
                          <BlockMath
                            math={matrixToLatex(
                              reponse.contributions.individuals
                            )}
                          />
                        </li>
                        <li>
                          Variables
                          <BlockMath
                            math={matrixToLatex(
                              reponse.contributions.variables
                            )}
                          />
                        </li>
                      </ul>
                      <br />
                      <br />
                      <strong>
                        Étape 10 : Représentation des variables à l'aide de
                        coefficient de correlation
                      </strong>
                      <br />
                      <br />
                      <ScatterCirclePlot matrix={reponse.correlations} />
                      <br />
                      <br />
                      <strong>Étape 11 : Les interpretations</strong>
                      <pre>
                        {generateText({
                          data: reponse.variable_classifications,
                        })}
                      </pre>
                      <br />
                      <br />
                      <strong>Étape 12 : Les statistiques</strong>
                      {generateMeans({ data: reponse.pc_statistics.means })}
                      <p>La variance</p>
                      {generateVariance({
                        data: reponse.pc_statistics.variance,
                      })}
                      <p>La covariance</p>
                      {!isUsingKaiser && (
                        <BlockMath
                          math={generateCovarianceLatex(
                            reponse.pc_statistics.covariance
                          )}
                        />
                      )}
                      <br />
                      <br />
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3">
                <Image src={Logo} alt="Madabina Logo" width={36} height={36} />
                <Label className="text-2xl moving-text">
                  Hi I am MadaBina.
                </Label>
              </div>
              <Label>How can I help you today</Label>
            </>
          )}
          <div className="flex flex-col items-center justify-center bg-card w-full p-4 rounded-3xl gap-4 border border-white/50">
            <Input
              placeholder="Message Madabina"
              className="focus-visible:ring-0 shadow-none border-none p-0 h-fit text-lg "
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></Input>
            <div className="w-full h-fit flex items-center justify-between">
              <button
                onClick={handleButtonClick}
                className="p-1 rounded-full hover:bg-black/10 transition-all"
              >
                <Plus />
              </button>
              <button
                className={clsx(
                  "p-1 rounded-full ",
                  query.length > 0 ? "bg-black" : "bg-black/20"
                )}
                onClick={handleStartConversation}
                disabled={query.length === 0}
              >
                <ArrowUp color={query.length > 0 ? "white" : "black"} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
